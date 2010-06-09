var sys  = require('sys');
// var net  = require('net');
var amqp = require('./modules/node-amqp/amqp');
exec = require('child_process').exec;

var connection = amqp.createConnection({ host: 'localhost' });
connection.addListener('ready', function () {
  var exchange      = connection.exchange('system');
  var user_exchange = connection.exchange('users');
  
  var workerQueue = connection.queue('node-worker');
  workerQueue.bind(exchange, 'worker.#')
  workerQueue.subscribeJSON(function (message) {
    sys.puts("worker queue message");
    sys.p(message)
    switch(message.task) {
      case 'screenshot':
        exec('./../webkit2png/webkit2png-0.5.sh -d -D node/screenshots ' + message.url, 
          function (error, stdout, stderr) {
            sys.print('stdout: ' + stdout);
            sys.print('stderr: ' + stderr);
            user_exchange.publish("users." + message.user_id, {'result': stdout, 'trigger': 'workdone'});
            if (error !== null) {
              sys.puts('exec error: ' + error);
            }
          });
        break;
      // example remove for production
      case 'eval':
        var result = eval(message.javascript);
        user_exchange.publish("users." + message.user_id, {'result': result, 'trigger': 'workdone'});
        break;
    }
  });
});

sys.puts('started');

// how to use node background workers:
// protonet.globals.notifications.bind('workdone', function(e, msg){ console.log(e, msg) })
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'screenshot', 'url':'http://www.google.de'}))
// or 
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'eval', 'javascript':'2*2'}))
// and you'll get a message whenever it's ready :)