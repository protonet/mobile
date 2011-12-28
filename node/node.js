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

  workerQueue.bind(exchange, "worker.#");
  workerQueue.subscribeJSON(function(message) {
    message = JSON.parse(message.data);
    sys.puts("worker queue message: " + utils.inspect(message));

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


  // Filesystem worker queue
  // Kept separate because it's not necessarily called by a client
  // (it's really just used for the evented I/O)
  //
  // Send JSON requests to the fs.worker queue:
  //   {"queue":"a fs. queue that you'll listen for a response on",
  //    "operation":"operation to run, i.e. list, copy, move, delete, info",
  //    "params":{"param-name":"param-value"}}
  //
  // Anything else that is in the object can be used as state values, as the
  // entire object is sent back in response, along with additional keys
  // (either "response" or "error", depending on what happened).
  var fsExchange = connection.exchange("fs"),
      fsQueue    = connection.queue("worker");

  fsQueue.bind(fsExchange, "fs.worker");
  fsQueue.subscribeJSON(function(message) {
    message = JSON.parse(message.data);
    sys.puts("filesystem worker queue message: " + utils.inspect(message));

    var callback = function(err, result) {
      if (err) {
        message.error = err;
      } else {
        message.result = result;
      }

      fsExchange.publish("fs." + message.queue, message);
    }

    require("./tasks/fs_worker")[message.operation](message.params, callback);
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
    case "upload":
      require("./tasks/upload").save(request, response, connection);
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