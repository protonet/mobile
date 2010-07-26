var sys = require("sys");
var fs  = require("fs");

/*----------------------------------- SOCKET TASKS -----------------------------------*/
var amqp = require('./modules/node-amqp/amqp');
connection = amqp.createConnection({ host: "localhost" });
connection.addListener("error", function(){
  console.log("error trying to reach the rabbit, please start your rabbitmq-server");
});
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
      // example, remove for production
      case "eval":
        publish(eval(message.javascript));
        break;
        
      case "http_proxy":
        require("./tasks/http_proxy").get(message.url, publish);
        break;
    }
  });
});


/*----------------------------------- HTTP TASKS -----------------------------------*/
var http      = require("http"),
    parseUrl  = require("url").parse;

http.createServer(function(request, response) {
  var parsedUrl = parseUrl(request.url, true),
      params    = parsedUrl.query,
      task      = parsedUrl.pathname.replace(/\//g, "");
  
  switch(task) {
    case "screenshot":
      require("./tasks/screenshot").make(params, response);
      break;
  }
}).listen(8124);


/*----------------------------------- STARTUP STUFF -----------------------------------*/
var tmp_file = 'tmp/pids/node.pid'
fs.writeFile(tmp_file, process.pid.toString(), function (err) {
  if (err) throw err;
  console.log('Pid-file saved!');
});
sys.puts("started with pid: " + tmp_file);

var stdin = process.openStdin();

function shutdownTasks() {
  console.log('Cleaning pid file.');
  fs.unlinkSync(tmp_file);
  process.exit(0);
}
process.addListener('SIGINT',  shutdownTasks);
process.addListener('SIGKILL', shutdownTasks);
process.addListener('SIGTERM', shutdownTasks);

// how to use node background workers:
// protonet.Notifications.bind('workdone', function(e, msg){ console.log(e, msg) })
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'screenshot', 'url':'http://www.google.de'}))
// or 
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'eval', 'javascript':'2*2'}))
// and you'll get a message whenever it's ready :)