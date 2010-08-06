var sys = require("sys");
var net = require("net");


var amqp = require('./modules/node-amqp/amqp');
amqp = amqp.createConnection({ host: "localhost", vhost: "/" });
amqp.addListener("error", function(){
  console.log("error trying to reach the rabbit, please start your rabbitmq-server");
});
var exchange, channelsExchange;
amqp.addListener("ready", function() {
  exchange          = amqp.exchange("system");
  channelsExchange  = amqp.exchange("channels");
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
  try {
    var message = JSON.parse(data.replace(/\0$/m, ""));
  } catch(error) {
    message = {};
  }
  if(message['x_target'] && message.x_target == "protonet.globals.communicationConsole.receiveMessage") {
    console.log('received TEXT message');
    channelsExchange.publish("channels." + message.channel_uuid, message);
  } else {
    console.log('received some OTHER kinda message');
  }
  
});

socket.addListener("end", function(){
  clearInterval(pinger); // stop pinging
  console.log('the other side closed the socket');
});

function write_json(json) {
  socket.write(JSON.stringify(json));
}

