var sys = require("sys");
var net = require("net");
var http = require('http');
var querystring = require('querystring');

var amqp = require('./modules/node-amqp/amqp');
amqp = amqp.createConnection({ host: "localhost", vhost: "/" });
amqp.addListener("error", function(){
  console.log("error trying to reach the rabbit, please start your rabbitmq-server");
});
var exchange, channelsExchange;
amqp.addListener("ready", function() {
  exchange          = amqp.exchange("system");
  channelsExchange  = amqp.exchange("channels");
  var channelsQueue     = amqp.queue("node-to-node-channels");
  
  channelsQueue.bind(channelsExchange, "channels.#");
  channelsQueue.subscribe(function(message) {
    if(true || message['x_target'] && message.x_target == "protonet.globals.communicationConsole.receiveMessage") {
      message = JSON.parse(message.data.toString('utf-8'));
      // sys.puts(sys.inspect(message));
      message.channel_id = remoteChannelUuidToId[message.channel_uuid];
      if(message.forwarded != 1 && message.channel_id) {
        sys.puts("received LOCAL message, forwarding to remote");
        var remoteNode = http.createClient(3001, 'localhost');
        var request = remoteNode.request('POST', '/tweets',
          {'host': 'localhost'});
        request.write(querystring.stringify({"message_channel_id":message.channel_id, "tweet": {"text_extension":message.text_extension, "message": message.message}}));
        request.end();
      }
    }
  });
  
});

// get channels in a mapping format from local
var localChannelUuidToId = {};
var localNode = http.createClient(3000, 'localhost');
var request = localNode.request('GET', '/networks/2/channels.json',
  {'host': 'localhost'});
request.end();
request.on('response', function (response) {
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    var channels = JSON.parse(chunk);
    for(i in channels) {
      localChannelUuidToId[channels[i].uuid] = channels[i].id;
    }
  });
});

var remoteChannelUuidToId = {};
var remoteNode = http.createClient(3001, 'localhost');
var request = remoteNode.request('GET', '/networks/1/channels.json',
  {'host': 'localhost'});
request.end();
request.on('response', function (response) {
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    var channels = JSON.parse(chunk);
    for(i in channels) {
      remoteChannelUuidToId[channels[i].uuid] = channels[i].id;
    }
  });
});


var socket = net.createConnection(5001, 'localhost');
socket.setEncoding('utf8');

socket.addListener("connect", function(){
  console.log('connected');
  write_json({'operation':'authenticate', 'payload':{'type':'node', 'node_uuid':'1'}});
  pinger = setInterval(function(){
    console.log('node.js is pinging...');
    write_json({'operation':'ping'});
  }, 30000);
});

socket.addListener("data", function(data){
  // console.log("raw: " + data);
  try {
    var message = JSON.parse(data.replace(/\0$/m, ""));
  } catch(error) {
    message = {};
  }
  if(message['x_target'] && message.x_target == "protonet.globals.communicationConsole.receiveMessage") {
    console.log('received TEXT message');
    // translate channel_id to the local id
    message.channel_id = localChannelUuidToId[message.channel_uuid];
    message.forwarded   = 1;
    if(message.channel_id) {
      channelsExchange.publish("channels." + message.channel_uuid, JSON.stringify(message));
      console.log('received REMOTE message, forwarding to local')
    }
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

