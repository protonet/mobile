var sys         = require("sys"),
    amqp        = require('./modules/node-amqp/amqp'),
    screenshot  = require("./tasks/screenshot"),
    httpProxy   = require("./tasks/http_proxy");

connection = amqp.createConnection({ host: "localhost" });
connection.addListener("ready", function() {
  var exchange      = connection.exchange("system"),
      userExchange  = connection.exchange("users"),
      workerQueue   = connection.queue("node-worker");
  
  workerQueue.bind(exchange, "worker.#");
  workerQueue.subscribeJSON(function(message) {
    sys.puts("worker queue message");
    sys.puts(sys.inspect(message));
    
    var publish = function(result) {
      userExchange.publish("users." + message.user_id, { result: result, trigger: "workdone" });
    };
    
    switch(message.task) {
      case "screenshot":
        screenshot.make(message.url, publish);
        break;
        
      // example, remove for production
      case "eval":
        publish(eval(message.javascript));
        break;
        
      case "http_proxy":
        httpProxy.get(message.url, publish);
        break;
    }
  });
});

sys.puts("started");

// how to use node background workers:
// protonet.Notifications.bind('workdone', function(e, msg){ console.log(e, msg) })
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'screenshot', 'url':'http://www.google.de'}))
// or 
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'eval', 'javascript':'2*2'}))
// and you'll get a message whenever it's ready :)