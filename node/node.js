var sys  = require('sys');
// var net  = require('net');
var amqp = require('./../node-amqp/amqp');
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
        exec('ls -al', 
          function (error, stdout, stderr) {
            sys.print('stdout: ' + stdout);
            user_exchange.publish("users." + message.user_id, {'result': stdout});
            sys.print('stderr: ' + stderr);
            if (error !== null) {
              sys.puts('exec error: ' + error);
            }
          });
        break;
    }
  });
});

sys.puts('started');

// how to use node background workers:
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'screenshot'}))
// and you'll get a message whenever it's ready :)