var sys                 = require("sys"),
    fs                  = require("fs"),
    util                = require('util'),
    path                = require('path'),
    mkdirp              = require('mkdirp'),
    url                 = require('url'),
    spawn               = require('child_process').spawn,
    
    // Files that can be accessed directly
    viewableFiles       = ["text/plain", "image/*", "video/*", "audio/*", "application/pdf", "application/x-shockwave-flash"],
    viewableFilesViaXHR = ["text/*", "application/xml", "application/json"],

    amqp                = require('amqp'),
    formidable          = require('formidable'),
    lookup_mime         = require('mime').lookup,

    RAILS_SESSION_KEY   = "_rails_dashboard_session",
    FILES_DIR           = "tmp/development/shared/files",
    USERS_DIR           = FILES_DIR + "/users",
    CHANNELS_DIR        = FILES_DIR + "/channels",
    
    virusScanCache      = {},
    virusScanResponder  = {},
    
    responses           = {},
    next_seq            = 0,
    queue,
    exchange;

function parseCookie(cookieStr) {
  var cookieObj = {};
  cookieStr.split(";").forEach(function(cookie) {
    var parts = cookie.split("=");
    cookieObj[parts[0].trim()] = unescape(parts[1] || "").trim();
  });
  return cookieObj;
}

function getSessionId(request) {
  return parseCookie(request.headers.cookie || "")[RAILS_SESSION_KEY];
}

function mkdirpAndJoin(baseDirectory, file) {
  if (file.relativePath) {
    file.relativePath = file.relativePath.replace(/\.\.\//g, "");
    var directory = path.join(baseDirectory, file.relativePath);
    mkdirp.sync(directory);
    return path.join(directory, file.name);
  } else {
    return path.join(baseDirectory, file.name);
  }
}

function setAccessControlHeaders(response, request) {
  console.log(global, global.env);
  if (global.env !== "development") {
    return;
  }
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
  response.setHeader('Access-Control-Allow-Methods', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
}

exports.bind = function(amqpConnection) {
  queue    = amqpConnection.queue("node-fs-http");
  exchange = amqpConnection.exchange("rpc");

  queue.bind(exchange, 'rpc.responses');
  queue.subscribeJSON(function(message) {
    message = JSON.parse(message.data);
    sys.puts(message.action + " verification queue message: " + util.inspect(message));
    var response = responses[message.seq];
    
    if (!message.result) {
      response.writeHead(403);
      response.end("error");
      return;
    }
    
    switch (message.action) {
      case 'upload':
        var userDirectory = USERS_DIR + "/" + message.params.user_id, responseArr = [];
        try { fs.mkdirSync(userDirectory); } catch (e) {}
        
        var userFiles = message.files.map(function(file) {
          var newFilePath = mkdirpAndJoin(userDirectory, file);
          
          delete virusScanCache[newFilePath];
          
          fs.rename(file.path, newFilePath);
          fs.chmod(newFilePath, 416); // 0640 (rw-r-----)
          file.path = newFilePath;
          
          responseArr.push(newFilePath.substr(FILES_DIR.length));
          return file;
        });
        
        if (message.params.channel_id) {
          var channelDirectory = CHANNELS_DIR + "/" + message.params.channel_id;
          try { fs.mkdirSync(channelDirectory); } catch (e) {}
          
          userFiles.forEach(function(file) {
            var newFilePath = mkdirpAndJoin(channelDirectory, file),
                symlink     = path.relative(path.dirname(newFilePath), file.path);
            
            delete virusScanCache[channelFilePath];
            
            try { fs.symlink(symlink, channelFilePath); } catch(e) {}
          });
        }
        
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(responseArr));
        break;

      case 'download':
        try {
          var files = message.params.paths,
              header = {};

          if (typeof(files) == 'string') { files = [files]; }
          
          var file = path.join(FILES_DIR, files[0]);
          if (files.length == 1 && !fs.statSync(file).isDirectory()) {
            header['Content-Type']        = lookup_mime(file);
            header['Content-Length']      = fs.statSync(file).size;
            header['Content-Disposition'] = 'attachment;filename="' + path.basename(file) + '"';
            response.writeHead(200, header);

            while (fs.lstatSync(file).isSymbolicLink()) {
              file = path.join(path.dirname(file), fs.readlinkSync(file));
            }

            fs.createReadStream(file)
              .addListener('data', function(data) {
                response.write(data, 'binary');
              })
              .addListener('end', function() {
                response.end();
              })
              .addListener("error", function() {
                response.end('Error');
              });
          } else {
            header['Content-Type'] = 'application/zip';
            header['Content-Disposition'] = 'attachment;filename="files.zip"';
            response.writeHead(200, header);
            
            var zip = spawn('zip', ['-r', '--names-stdin', '-'], { cwd: FILES_DIR });

            zip.stdout.on('data', function(data) {
              response.write(data, 'binary');
            });
            zip.on('exit', function(code) {
              if (code !== 0) {
                console.log('zip process exited with code ' + code);
              }

              response.end();
            });

            files = files.map(function(file) {
              return path.join('.', file) + '\n'; // stop / from going to fs root
            });
            zip.stdin.end(files.join());
          }

        } catch(ex) {
          response.writeHead(500);
          response.end("error: " + ex);
        }
        break;
      case "view":
        break;
    }
  });
};

exports.upload = function(request, response) {
  setAccessControlHeaders(response, request);

  var form      = new formidable.IncomingForm(),
      files     = [],
      fields    = {};
      
  if (request.method == 'OPTIONS') {
    response.writeHead(200);
    response.end();
    return;
  }
  
  form
    .on('field', function(field, value) {
      fields[field] = value;
    })
    .on('file', function(field, file) {
      files.push(file);
    })
    .on('end', function() {
      next_seq += 1;
      responses[next_seq] = response;
      
      fields.session_id = getSessionId(request);
      
      exchange.publish("rpc.requests", {
        object: 'auth',
        method: 'check_session',
        params: fields,
        action: 'upload',
        files:  files,
        seq:    next_seq
      });
      sys.puts("Published RPC call");
    });

  form.parse(request);
};

exports.snapshot = function(request, response) {
  setAccessControlHeaders(response, request);
  
  next_seq += 1;
  responses[next_seq] = response;
  
  var parsedUrl = url.parse(request.url, true),
      params    = parsedUrl.query,
      path      = "/tmp/snapshot_" + new Date().getTime() + ".jpg",
      name      = "Snapshot by " + params.user_name + " " + new Date().getTime() + ".jpg",
      tmpFile   = fs.createWriteStream(path);
  
  request.on("data", function(chunk) {
    tmpFile.write(chunk);
  });
  
  request.on("end", function() {
    tmpFile.end();
    
    params.session_id = getSessionId(request);
    
    exchange.publish("rpc.requests", {
      object: 'auth',
      method: 'check_session',
      params: params,
      action: 'upload',
      files:  [{ name: name, path: path, relativePath: "snapshots/" }],
      seq:    next_seq
    });
    sys.puts("Published RPC call");
  });
  
};

exports.download = function(request, response) {
  setAccessControlHeaders(response, request);

  next_seq += 1;
  responses[next_seq] = response;
  
  var params = url.parse(request.url, true).query;
  params.session_id = getSessionId(request);
  
  exchange.publish("rpc.requests", {
    object: 'fs',
    method: 'check_auth',
    params: params,
    action: 'download',
    seq: next_seq
  });
  sys.puts("Published RPC call");
};

exports.scan = function(request, response) {
  setAccessControlHeaders(response, request);
  
  function respond(isMalicious) {
    response.writeHead(200);
    response.end(JSON.stringify({ malicious: isMalicious }));
  }
  
  var params = url.parse(request.url, true),
      file   = path.join(FILES_DIR, params.query.path);
  
  // is cached?
  if (file in virusScanCache) {
    respond(virusScanCache[file]);
    return;
  }
  
  // Handle multiple scans for the same file at the same time
  if (!virusScanResponder[file]) {
    virusScanResponder[file] = [];
    
    var scan = spawn("clamscan", [file]);
    scan.on('exit', function(code) {
      var responder = virusScanResponder[file],
          length    = responder.length,
          i         = 0;
      for (; i<length; i++) {
        responder[i](code);
      }
      delete virusScanResponder[file];
    });
    
    // kill the process if it runs longer than X seconds
    setTimeout(function() { scan.kill(); }, 20000);
  }
  
  virusScanResponder[file].push(function(code) {
    var isMalicious;
    if (code == 0) {
      isMalicious = false;
    } else if (code == 1) {
      isMalicious = true;
    }

    // cache
    if (typeof(isMalicious) !== "undefined") {
      virusScanCache[file] = isMalicious;
    }

    respond(isMalicious);
  });
};
