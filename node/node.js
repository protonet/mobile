var sys = require("sys");
var fs  = require("fs");

/*----------------------------------- CONFIG  ----------------------------------------*/
var htmlTaskPort = 8124;
process.argv.forEach(function(val){
  var match;
  if(match = val.match(/port=(\d+)/)) {
    htmlTaskPort = parseInt(match[1], 10);
  }
});

var Hoptoad = require('./modules/node-hoptoad/hoptoad-notifier').Hoptoad;
Hoptoad.key = 'e0e395c06aa4a6756b5d585fee266999';

// process.addListener('uncaughtException', function(error) {
//   Hoptoad.notify(error);
// });

/*----------------------------------- SOCKET TASKS -----------------------------------*/
var amqp = require('./modules/node-amqp/amqp');
connection = amqp.createConnection({ host: "localhost", vhost: "/" });
connection.addListener("error", function(){
  console.log("error trying to reach the rabbit, please start your rabbitmq-server");
});
connection.addListener("ready", function() {
  var exchange      = connection.exchange("worker"),
      userExchange  = connection.exchange("users"),
      workerQueue   = connection.queue("node-worker");
  
  workerQueue.bind(exchange, "#");
  workerQueue.subscribeJSON(function(message) {
    sys.puts("worker queue message");
    sys.puts(message.data);
    message = JSON.parse(message.data);
    
    var publish = function(result, trigger) {
      userExchange.publish("users." + message.user_id, { result: result, trigger: (trigger + ".workdone") });
    };
    
    switch(message.task) {
      // example, remove for production
      case "eval":
        // just enable for testing
        // publish(eval(message.javascript), "eval");
        break;
      case "screenshot":
        // just enable for testing
        // require("./tasks/screenshot").make_and_publish(message.url, publish);
        break;
      case "http_proxy":
        console.log(message);
        require("./tasks/http_proxy").get(message.url, publish);
        break;
    }
  });
});

/*----------------------------------- HTTP TASKS  ----------------------------------*/
/*----------------------------------- SCREENSHOTS ----------------------------------*/
var http      = require("http"),
    parseUrl  = require("url").parse;

http.createServer(function(request, response) {

  var parsedUrl = parseUrl(request.url, true),
      params    = parsedUrl.query,
      task      = parsedUrl.pathname.replace(/\//g, ""),
      headers   = request.headers;

  switch(task) {
    case "screenshooter":
      require("./tasks/screenshot").make_and_send(params.url, response);
      break;
    case "image_proxy":
      require("./tasks/image_proxy").proxy(params, headers, response);
      break;
    case "snapshooter":
      require("./tasks/snapshot").save(request, response);
      break;
    default:
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('WTF?\n');
  }
  
}).listen(htmlTaskPort);

/*----------------------------------- STARTUP STUFF -----------------------------------*/
var tmp_file = 'tmp/pids/node_' + htmlTaskPort + '.pid';
fs.writeFile(tmp_file, process.pid.toString(), function (err) {
  if (err) throw err;
  console.log('Pid-file saved!');
});
sys.puts("started with pid: " + tmp_file);

var stdin = process.openStdin();

/*----------------------------------- SHUTDOWN STUFF ----------------------------------*/
function shutdownTasks() {
  console.log('Cleaning pid file.');
  fs.unlinkSync(tmp_file);
  process.exit(0);
}
process.addListener('SIGINT',  shutdownTasks);
process.addListener('SIGKILL', shutdownTasks);
process.addListener('SIGTERM', shutdownTasks);

// how to use node background workers:
// protonet.bind('workdone', function(e, msg){ console.log(e, msg) })
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'screenshot', 'url':'http://www.google.de'}))
// or 
// protonet.globals.dispatcher.sendMessage(JSON.stringify({'operation':'work', 'task':'eval', 'javascript':'2*2'}))
// and you'll get a message whenever it's ready :)