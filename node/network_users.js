require('./modules/underscore');
var util  = require('util'),
    exec  = require('child_process').exec,
    Step  = require('./modules/step');

var arpRefresh = function(callback) {
  exec('arp -a', function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      console.log("foobar1 error")
      return callback(error, []);
    }
    
    var devices = [];
    var lines = stdout.split("\n");
    
    for(var i=0; i < lines.length; i++) {
      if(lines[i] == null || lines[i].length == 0)
      continue;
      var arp_array = lines[i].split(" at ");
      var arp_name_ip = arp_array[0].split(" ");
      var arp_mac = arp_array[1].split(" ");
      
      arp_name_ip[1] = arp_name_ip[1].replace(/[\(\)]/g, "");
      // console.log('Name: \t' + arp_name_ip[0]);
      console.log('arp Ip: \t' + arp_name_ip[1]);
      // console.log('Mac: \t' + arp_mac[0]);
      // console.log('--\n');
      devices.push({ip:arp_name_ip[1], hostname: arp_name_ip[0], mac: arp_mac[0]});
    }
    console.log("foobar1");
    callback(null, devices);
  });
};


var dnsLeaseRefresh = function(callback) {
  exec('cat /var/lib/misc/dnsmasq.leases', function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      console.log("foobar2 error");
      return callback(error, []);
    }
    
    var devices = [];
    var lines = stdout.split("\n");
    
    for(var i=0; i < lines.length; i++) {
      if(lines[i] == null || lines[i].length == 0)
      continue;
      var lease_array = lines[i].split(" ");
      var hostname = lease_array[3];
      hostname = hostname.replace("*", "?"); // to keep the format the same as arp
      var ip  = lease_array[2];
      var mac = lease_array[4];
      
      // console.log('Name: \t' + hostname);
      console.log('dns Ip: \t' + ip);
      // console.log('Mac: \t' + mac);
      // console.log('--\n');
      devices.push({ip: ip, hostname: hostname, mac: mac});
    }
    console.log("foobar2");
    callback(null, devices);
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
  
  var refresh = function(systemExchange) {
    Step(
      function refresh() {
        dnsLeaseRefresh(this.parallel());
        arpRefresh(this.parallel());
      },
      function arp(err, dnsDevices, arpDevices) {
        if (err) {
          // throw err;
        }
        console.log("dns ----->>>>  " + dnsDevices);
        console.log("arp ----->>>>  " + arpDevices);
        var devices = dnsDevices.concat(arpDevices)//.uniq();
        console.log("dev ----->>>>  " + devices);
        systemExchange.publish("system.update_connected_devices", {devices: devices, trigger: "system.update_connected_devices"});
        setTimeout(refresh, 10000, systemExchange);
      }
    );
  }

  refresh(systemExchange);
  
});

