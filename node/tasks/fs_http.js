var sys                 = require("sys"),
    fs                  = require("fs"),
    util                = require('util'),
    path                = require('path'),
    url                 = require('url'),
    spawn               = require('child_process').spawn,
    
    // Files that can be accessed directly
    viewableFiles       = ["text/plain", "image/*", "video/*", "audio/*", "application/pdf", "application/x-shockwave-flash"],
    viewableFilesViaXHR = ["text/*", "application/xml", "application/json"],

    amqp                = require('../modules/node-amqp/amqp'),
    formidable          = require('../modules/node-formidable'),
    lookup_mime         = require('../modules/node-mime').lookup,

    FILES_DIR           = "./tmp/development/shared/files/",
    USERS_DIR           = FILES_DIR + "/users/",
    CHANNELS_DIR        = FILES_DIR + "/channels/",
    
    virusScanCache      = {},
    virusScanResponder  = {},
    
    responses           = {},
    next_seq            = 0,
    queue,
    exchange;

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
        console.log("--------------------------------");
        console.log(message.params.user_id);
        var userDirectory = USERS_DIR + message.params.user_id + '/';

        try { fs.mkdirSync(userDirectory); } catch (e) {}
        
        var userFiles = message.files.map(function(file) {
          var newFilePath = userDirectory + file.name;
          
          delete virusScanCache[newFilePath];
          
          fs.rename(file.path, newFilePath);
          fs.chmod(newFilePath, 416); // 0640 (rw-r-----)
          file.path = newFilePath;
          return file;
        });
        
        if (message.params.channel_id) {
          var channelDirectory = CHANNELS_DIR + message.params.channel_id + '/';
          
          try { fs.mkdirSync(channelDirectory); } catch (e) {}
          
          userFiles.forEach(function(file) {
            var channelFilePath = channelDirectory + file.name,
                symlink         = path.relative(path.dirname(channelFilePath), file.path);
            delete virusScanCache[channelFilePath];
            try { fs.symlink(symlink, channelFilePath); } catch(e) {}
          });
        }
        
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(userFiles));
        break;

      case 'download':
        try {
          var files = message.params.paths,
              header = {};

          if (typeof(files) == 'string') { files = [files]; }
          
          var file = path.join(FILES_DIR, files[0]);
          if (files.length == 1 && !fs.statSync(file).isDirectory()) {
            header['Content-Type']        = lookup_mime(file);
            header['Content-Length']      = fs.statSync(file).size
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
            })
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
        
    }
  });
};

exports.upload = function(request, response) {
  var form      = new formidable.IncomingForm(),
      files     = [],
      fields    = {};

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');

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
      
      exchange.publish("rpc.requests", {
        object: 'auth',
        method: 'check_token',
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
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST');
  
  next_seq += 1;
  responses[next_seq] = response;
  
  var data    = "",
      params  = url.parse(request.url, true);
      path    = "/tmp/snapshot_" + new Date().getTime() + ".jpg",
      name    = "snapshot/Snapshot by " + params.query.user_name + " " + new Date() + ".jpg",
      tmpFile = fs.createWriteStream(path);
  
  request.on("data", function(chunk) {
    tmpFile.write(chunk);
  });
  
  request.on("end", function() {
    tmpFile.end();
    
    exchange.publish("rpc.requests", {
      object: 'auth',
      method: 'check_token',
      params: params.query,
      action: 'upload',
      files:  [{ name: name, path: path }],
      seq:    next_seq
    });
    sys.puts("Published RPC call");
  });
  
};

exports.download = function(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET');

  next_seq += 1;
  responses[next_seq] = response;
  
  var params = url.parse(request.url, true);

  exchange.publish("rpc.requests", {
    object: 'fs',
    method: 'check_auth',
    params: params.query,
    action: 'download',
    seq: next_seq
  });
  sys.puts("Published RPC call");
};

exports.scan = function(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  
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
