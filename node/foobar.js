var sys = require("sys");
var net = require("net");


var amqp = require('./modules/node-amqp/amqp');
amqp = amqp.createConnection({ host: "localhost" });
amqp.addListener("error", function(){
  console.log("error trying to reach the rabbit, please start your rabbitmq-server");
});
amqp.addListener("ready", function() {
  var exchange      = amqp.exchange("system"),
      userExchange  = amqp.exchange("channels"),
      workerQueue   = amqp.queue("node-worker");
});

var socket = net.createConnection(5001, 'localhost');
socket.setEncoding('utf8');
socket.addListener("connect", function(){
  console.log('connected');
  write_json({'operation':'authenticate', 'payload':{'type':'node', 'node_uuid':'1'}});
  pinger = setInterval(function(){
    console.log('ping');
    write_json({'operation':'ping'});
  }, 30000);
});

socket.addListener("data", function(data){
  console.log("raw: " + data);
  var message = JSON.parse(data.replace(/\0$/m, ""));
  if(message['x_target'] && message.x_target == "protonet.globals.communicationConsole.receiveMessage") {
    console.log('received text message' + message);
  } else {
    console.log('received some other kinda message');
  }
  
  // userExchange.publish("channel." + message.user_id, { result: result, trigger: "workdone" });
  
});

socket.addListener("end", function(){
  clearInterval(pinger); // stop pinging
  console.log('the other side closed the socket');
})

function write_json(json) {
  socket.write(JSON.stringify(json));
}

