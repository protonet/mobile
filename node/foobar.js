var sys = require("sys");
var net = require("net");

var connection = net.createConnection(5000, 'localhost');

connection.addListener("connect", function(){
  console.log('connected');
  connection.write(JSON.stringify({'operation':'authenticate', 'payload':{'type':'node', 'node_uuid':'1'}}));
});

connection.addListener("data", function(data){
  console.log(data);
});

connection.addListener("end", function(){
  console.log('the other side closed the connection');
})

