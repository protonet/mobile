var sys  = require("util"),
    fs   = require("fs"),
    util = require("util");

process.addListener("uncaughtException", function (err) {
  console.log("Uncaught exception: " + err);
});

/*----------------------------------- CONFIG  ----------------------------------------*/
var envPaths = {
  development: "./tmp/development/shared/files",
  production:  "/home/protonet/dashboard/shared/files",
  test:        "./tmp/test/shared/files",
  cucumber:    "./tmp/test/shared/files"
};

global.htmlTaskPort = 8124;
global.env          = "development";

process.argv.forEach(function(val){
  var match;
  if (match = val.match(/port=(\d+)/)) {
    global.htmlTaskPort = +match[1];
  }
  
  if (match = val.match(/env=(\w+)/)) {
    global.env = match[1];
  }
});

global.FILES_PATH = envPaths[global.env] || envPaths.development;

/*----------------------------------- SOCKET TASKS -----------------------------------*/
var tries = 0;

function setupConnection(connection) {
  /**
   * RPC queue
   * Kept separate because it's not called directly by a client
   * (it's really just used for the evented filesystem I/O)
   *
   * Send JSON requests to the rpc.node queue:
   *   {"queue":"a queue on the rpc exchange that you'll listen for a response on",
   *    "method":"operation to run, i.e. list, copy, move, delete, info",
   *    "params":{"param-name":"param-value"}}
   *
   * Anything else that is in the object can be used as state values, as the
   * entire object is sent back in response, along with additional keys
   * (either "response" or "error", depending on what happened).
   */
  var fsWorker    = require("./tasks/fs_worker"),
      fsHttp      = require("./tasks/fs_http"),
      rpcExchange = connection.exchange("rpc"),
      rpcQueue    = connection.queue("node");

  fsWorker.init(connection);
  fsHttp.init(connection);

  rpcQueue.bind(rpcExchange, "rpc.node");
  rpcQueue.subscribeJSON(function(message) {
    message = JSON.parse(message.data);
    sys.puts("rpc worker queue message: " + util.inspect(message));

    var callback = function(err, result) {
      message.error = err;
      message.result = result;

      rpcExchange.publish('rpc.' + message.queue, message);
    };

    fsWorker[message.method](message.params, callback);
  });
}

function createConnection() {
  if (++tries > 10) {
    console.log("Error trying to reach the rabbit after 10 tries");
    return;
  }
  
  var amqp        = require('amqp'),
      connection  = amqp.createConnection({ host: "localhost", vhost: "/" });
  
  connection.addListener("error", function() {
    setTimeout(createConnection, 4000);
  });
  
  connection.addListener("ready", function() {
    console.log("Established connection to rabbit after " + tries + " tries");
    setupConnection(connection);
  });
}

createConnection();


/*----------------------------------- HTTP TASKS  ----------------------------------*/
/*----------------------------------- SCREENSHOTS ----------------------------------*/
var http      = require("http"),
    parseUrl  = require("url").parse;

http.createServer(function(request, response) {
  var parsedUrl = parseUrl(request.url, true),
      params    = parsedUrl.query,
      task      = parsedUrl.pathname.replace(/^\/|\/$/g, ""),
      headers   = request.headers;

  switch(task) {
    case "screenshooter":
      require("./tasks/screenshot").make_and_send(params.url, response);
      break;
    case "image_proxy":
      require("./tasks/image_proxy").proxy(params, headers, response);
      break;
    case "fs/snapshot":
    case "fs/upload":
    case "fs/download":
    case "fs/display":
    case "fs/thumbnail":
    case "fs/scan":
      var method = require("./tasks/fs_http")[task.split("/")[1]];
      method(request, response);
      break;
    case "scrape":
      require("./tasks/scrape").scrape(params, response);
      break;
    default:
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('WTF?\n');
  }

}).listen(global.htmlTaskPort);

/*----------------------------------- STARTUP STUFF -----------------------------------*/
var tmp_file = 'tmp/pids/node_' + global.htmlTaskPort + '.pid';
fs.writeFile(tmp_file, process.pid.toString(), function (err) {
  if (err) {
    throw err;
  }
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