var util   = require('util'),
exec  = require('child_process').exec;

var arpRefresh = function(systemExchange) {
  exec('arp -a', function (error, stdout, stderr) {

    if (error !== null) {
      console.log('exec error: ' + error);
    }
    
    var devices = []
    var lines = stdout.split("\n");
    
    for(var i=0; i < lines.length; i++) {
      if(lines[i] == null || lines[i].length == 0)
      continue;
      var arp_array = lines[i].split(" at ");
      var arp_name_ip = arp_array[0].split(" ");
      var arp_mac = arp_array[1].split(" ");
      
      arp_name_ip[1] = arp_name_ip[1].replace(/[\(\)]/g, "");
      console.log('Name: \t' + arp_name_ip[0]);
      console.log('Ip: \t' + arp_name_ip[1]);
      console.log('Mac: \t' + arp_mac[0]);
      console.log('--\n');
      devices.push({hostname: arp_name_ip[0], ip: arp_name_ip[1], mac: arp_mac[0]})
    }
    systemExchange.publish("system.update_connected_devices", {devices: devices, trigger: "system.update_connected_devices"});
    setTimeout(arpRefresh, 10000, systemExchange);
  });
  
};

var amqp = require('./modules/node-amqp/amqp');
connection = amqp.createConnection({ host: "localhost", vhost: "/" });
connection.addListener("error", function(){
  console.log("error trying to reach the rabbit, please start your rabbitmq-server");
});
connection.addListener("ready", function() {
  var exchange      = connection.exchange("worker"),
      systemExchange  = connection.exchange("system");
  
  arpRefresh(systemExchange);
  
});

