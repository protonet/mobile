var sys                   = require("util"),
    fs                    = require("fs"),
    util                  = require('util'),
    path                  = require('path'),
    mkdirp                = require('mkdirp'),
    url                   = require('url'),
    Step                  = require('step'),
    spawn                 = require('child_process').spawn,
    xattr                 = require('xattr'),
    
    // Files that can be accessed directly
    embeddableFiles       = [
                            "text/plain", "image/jpeg", "image/png", "image/gif", "image/svg",
                            "image/bmp", "image/tiff", "image/svg+xml", "application/postscript",
                            "application/pdf", "application/x-shockwave-flash"
                          ],

    amqp                  = require('amqp'),
    formidable            = require('formidable'),
    lookupMime            = require('mime').lookup,

    RAILS_SESSION_KEY     = "_rails_dashboard_session",
    ROOT_DIR              = global.FILES_PATH,
    
    REG_EXP_PARENT_FOLDER = /\.\.\//g,
    
    virusScanCache        = {},
    virusScanResponder    = {},
    
    FILE_PERMISSIONS    = 432, // 0660
    FOLDER_PERMISSIONS  = 504, // 0770
    
    responses             = {},
    next_seq              = 0,
    Iconv,
    queue,
    exchange;


function touch(file) {
  var now = new Date();
  fs.utimes(file, now, now);
}

function mkdirSync(dir) {
  mkdirp.sync(dir, FOLDER_PERMISSIONS);
  touch(dir);
}

function normalizeInput(str) {
  if (process.platform !== 'darwin') {
    Iconv = Iconv || require('iconv').Iconv;
    str = new Iconv("utf8-mac", "utf8//TRANSLIT//IGNORE").convert(str).toString();
  }
  return str;
}

function absolutePathForFrontend(absolutePath) {
  var relativePath = "/" + path.relative(ROOT_DIR, absolutePath);
  if (relativePath.slice(-1) !== "/" && absolutePath.slice(-1) === "/") {
    relativePath += "/";
  }
  return relativePath;
}

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

function escapePath(path) {
  return path.replace(REG_EXP_PARENT_FOLDER, "");
}

function setAccessControlHeaders(response, request) {
  if (global.env !== "development") {
    return;
  }
  
  if (!request.headers.origin) {
    return;
  }
  
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
  response.setHeader('Access-Control-Allow-Methods', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Expose-Headers', '*');
}

exports.init = function(amqpConnection) {
  queue    = amqpConnection.queue("node-fs-http");
  exchange = amqpConnection.exchange("rpc");

  queue.bind(exchange, 'rpc.responses');
  queue.subscribeJSON(function(message) {
    message = JSON.parse(message.data);
    sys.puts(message.action + " verification queue message: " + util.inspect(message));
    var response = responses[message.seq];
    delete responses[message.seq];
    
    if (!message.result) {
      response.writeHead(403);
      response.end("error");
      return;
    }
    
    switch (message.action) {
      case 'upload':
        var targetDir   = ROOT_DIR + (message.params.target_folder || ""),
            file        = message.file;

        mkdirSync(targetDir, FOLDER_PERMISSIONS);
        
        file.name = normalizeInput(file.name);
        
        var newFilePath = path.join(targetDir, file.name);
        
        fs.rename(file.path, newFilePath, function(err) {
          fs.chmod(newFilePath, FILE_PERMISSIONS);
          
          try {
            // this doesn't work with file paths including umlauts
            xattr.set(newFilePath, "user.owner", message.params.user_id || -1);
          } catch(e) {
            console.log("Failed to set extended attributes on", newFilePath);
          }
          
          file.path = newFilePath;

          delete virusScanCache[newFilePath];

          response.writeHead(200, { "Content-Type": "application/json" });

          response.end(JSON.stringify({
            type:     "file",
            modified: new Date(),
            name:     file.name,
            size:     file.size,
            mime:     file.mime,
            path:     absolutePathForFrontend(newFilePath)
          }));
        });
        break;
        
      case 'download':
        try {
          if (typeof(message.params.paths) === 'string') {
            message.params.paths = [message.params.paths];
          }
          
          var file              = path.join(ROOT_DIR, message.params.paths[0]),
              stat              = fs.statSync(file),
              contentLength     = stat.size,
              contentType       = lookupMime(file),
              shouldBeEmbedded  = message.params.embed == "true" && embeddableFiles.indexOf(contentType) !== -1,
              header            = {},
              readStream,
              start,
              end;
          
          // Make sure that the user is not downloading a symbolic link but it's target
          while (fs.lstatSync(file).isSymbolicLink()) {
            file = path.join(path.dirname(file), fs.readlinkSync(file));
          }
          
          header['Content-Type']  = contentType;
          
          if (!shouldBeEmbedded) {
            header['Content-Disposition'] = 'attachment;filename="' + path.basename(file) + '"';
          }
          
          if (global.env === "production") {
            header['X-Sendfile'] = file;
            response.writeHead(200, header);
            response.end();
          } else {
            header['Content-Length'] = contentLength;
            response.writeHead(200, header);
            readStream = fs.createReadStream(file);
            readStream.pipe(response);
          }
        } catch(ex) {
          response.writeHead(500);
          response.end("error: " + ex);
        }
        break;
    }
  });
};

exports.upload = function(request, response) {
  setAccessControlHeaders(response, request);
  
  if (request.method == 'OPTIONS') {
    response.writeHead(200);
    response.end();
    return;
  }
  
  var form      = new formidable.IncomingForm(),
      fields    = {},
      files     = [];
  
  form
    .on('field', function(field, value) {
      fields[field] = value;
    })
    .on('file', function(field, file) {
      files.push(file);
    })
    .on('end', function() {
      // expected by fs.check_auth_and_write_access
      fields.paths = fields.target_folder;
      
      next_seq += 1;
      responses[next_seq] = response;
      
      exchange.publish("rpc.requests", {
        object: 'fs',
        method: 'check_auth_and_write_access',
        params: fields,
        action: 'upload',
        file:   files[0],
        seq:    next_seq
      });
      
      sys.puts("Published RPC call");
    });

  form.parse(request);
};

exports.snapshot = function(request, response) {
  setAccessControlHeaders(response, request);
  
  if (request.method == 'OPTIONS') {
    response.writeHead(200);
    response.end();
    return;
  }
  
  next_seq += 1;
  responses[next_seq] = response;
  
  var parsedUrl = url.parse(request.url, true),
      params    = parsedUrl.query,
      path      = "/tmp/snapshot_" + new Date().getTime() + ".jpg",
      name      = "Snapshot by " + params.user_name + " " + new Date().getTime() + ".jpg",
      tmpFile   = fs.createWriteStream(path);
      
  params.target_folder = "/users/" + params.user_id + "/snapshots/";
  
  request.on("data", function(chunk) {
    tmpFile.write(chunk);
  });
  
  request.on("end", function() {
    tmpFile.end();
    
    // expected by fs.check_auth_and_write_access
    params.paths = params.target_folder;
    
    exchange.publish("rpc.requests", {
      object: 'fs',
      method: 'check_auth_and_write_access',
      params: params,
      action: 'upload',
      files:  { name: name, path: path },
      seq:    next_seq
    });
    
    sys.puts("Published RPC call");
  });
  
};

exports.download = function(request, response) {
  setAccessControlHeaders(response, request);
  
  if (request.method == 'OPTIONS') {
    response.writeHead(200);
    response.end();
    return;
  }
  
  next_seq += 1;
  responses[next_seq] = response;
  
  var params = url.parse(request.url, true).query;
  if (!params.token) {
    params.session_id = getSessionId(request);
  }
  
  exchange.publish("rpc.requests", {
    object: 'fs',
    method: 'check_auth_and_read_access',
    params: params,
    action: 'download',
    seq:    next_seq
  });
  sys.puts("Published RPC call");
};

exports.scan = function(request, response) {
  setAccessControlHeaders(response, request);
  
  function respond(isMalicious) {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ malicious: isMalicious }));
  }
  
  var params = url.parse(request.url, true),
      file   = path.join(ROOT_DIR, params.query.path);
  
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
