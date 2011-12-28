var sys             = require("sys"),
    fs              = require("fs"),
    util            = require('util'),
    path            = require('path'),
    amqp            = require('../modules/node-amqp/amqp'),
    formidable      = require("../modules/node-formidable"),
    USERS_DIR       = "../shared/files/users/",
    CHANNELS_DIR    = "../shared/files/channels/",
    queue,
    exchange;

exports.save = function(request, response, amqpConnection) {
  var form      = new formidable.IncomingForm(),
      files     = [],
      fields    = {};


  if (!queue) {
    queue = amqpConnection.queue("node-upload-worker");
    exchange = amqpConnection.exchange("rpc");

    queue.bind(exchange, 'rpc.responses');
    queue.subscribeJSON(function(message) {
      message = JSON.parse(message.data);
      sys.puts("upload verification queue message: " + util.inspect(message));

      if (!message.result) { return; }

      var userDirectory = USERS_DIR + message.params.user_id + '/',
          channelDirectory = CHANNELS_DIR + message.params.channel_id + '/';

      try { fs.mkdirSync(userDirectory);    } catch (e) {}
      try { fs.mkdirSync(channelDirectory); } catch (e) {}

      message.files.forEach(function(file) {
        var userFile    = userDirectory + file.name,
            channelFile = channelDirectory + file.name,
            symlink     = path.relative(path.dirname(channelFile), userFile);

        fs.rename(file.path, userFile);
        fs.chmod(userFile, 416); // 0640 (rw-r-----)
        try { fs.symlink(symlink, channelFile); } catch(e) {}
      });
    });
  }

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
      exchange.publish("rpc.requests", { object: 'auth', method: 'check_token', params: fields, files: files });
      sys.puts("Published RPC call");

      response.writeHead(200);

      // we need to have something in the response body
      // so that flash can detect a successful upload
      response.end("success");
    });

  form.parse(request);
};