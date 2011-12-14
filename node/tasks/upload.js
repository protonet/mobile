var sys             = require("sys"),
    fs              = require("fs"),
    util            = require('util'),
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
      
      if (!message.result) {
        return;
      }
    });
    /*
        var directory = USERS_DIR + fields['user_id'] + '/';


        try {
          fs.mkdirSync(directory);
        } catch (e) {}

        files.forEach(function(file) {
          fs.rename(file.path, directory + file.name)
        });

        response.writeHead(200, {'content-type': 'application/json'});

        var fileNames    = files.map(function(f) { return file.name; }),
            responseBody = JSON.stringify(fileNames);*/
  }
  
  form
    .on('field', function(field, value) {
      fields[field] = value;
    })
    .on('file', function(field, file) {
      files.push(file);
    })
    .on('end', function() {
      exchange.publish("rpc.requests", { method: 'check_auth', params: fields, files: files });
      sys.puts("Published RPC call");
      
      response.writeHead(204);
      response.end();
    });
  
  form.parse(request);
};