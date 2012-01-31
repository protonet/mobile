var sys                 = require("sys"),
    fs                  = require("fs"),
    util                = require('util'),
    path                = require('path'),
    url                 = require('url'),
    spawn               = require('child_process').spawn,

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
    switch (message.action) {
      case 'upload':
        if (!message.result) { return; }

        var userDirectory = USERS_DIR + message.params.user_id + '/',
            channelDirectory = CHANNELS_DIR + message.params.channel_id + '/';

        try { fs.mkdirSync(userDirectory);    } catch (e) {}
        try { fs.mkdirSync(channelDirectory); } catch (e) {}
        
        message.files.forEach(function(file) {
          var userFile    = userDirectory + file.name,
              channelFile = channelDirectory + file.name,
              symlink     = path.relative(path.dirname(channelFile), userFile);
          
          delete virusScanCache[userFile];
          delete virusScanCache[channelFile];
          
          fs.rename(file.path, userFile);
          fs.chmod(userFile, 416); // 0640 (rw-r-----)
          try { fs.symlink(symlink, channelFile); } catch(e) {}
        });
        break;

      case 'download':
        if (message.result) {
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
              
              var zip = spawn('zip', ['-r', '--names-stdin', '-'], { cwd: FILES_DIR })

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
            response.end('Error');
          }

        } else {
          response.writeHeader(403);
          response.end("error");
        }
        break;
    }
  });
}

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
      exchange.publish("rpc.requests", {
        object: 'auth',
        method: 'check_token',
        params: fields,
        action: 'upload',
        files: files
      });
      sys.puts("Published RPC call");

      response.writeHead(200);

      // we need to have something in the response body
      // so that flash can detect a successful upload
      response.end("success");
    });

  form.parse(request);
};

exports.download = function(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');

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
