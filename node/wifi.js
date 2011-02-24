var util   = require('util'),
exec  = require('child_process').exec,
child;


var recvCount = 0;
var body = "hello world";


child = exec('arp -a | grep 5',
function (error, stdout, stderr) {

	// console.log('stdout: ' + stdout);
	var json = "{";
		
	// tmp = stdout.toString();
	lines = stdout.split("\n");
	for(var i=0; i < lines.length; i++) {
		if(lines[i] == null || lines[i].length == 0)
		continue;
		var arp_array = lines[i].split(" at ");
		var arp_name_ip = arp_array[0].split(" ");
		var arp_mac = arp_array[1].split(" ");
		

		// arp_data += '"computer" : {"id" : ' + i + ', "name" : "' + arp_name_ip[0] + '", "ip" : "' + arp_name_ip[1] + '", "mac" : "' + arp_mac[0] + '"},';

		// console.log('Name: \t' + arp_name_ip[0]);
		// console.log('Ip: \t' + arp_name_ip[1]);
		// console.log('Mac: \t' + arp_mac[0]);
		// console.log('--\n');		
	}
	
	// var arp_data = arp_data.substring(0,arp_data.length-1) + "}";
	console.log('-----\n' + arp_data + '\n');		

	// console.log('stderr: ' + stderr);
	if (error !== null) {
		console.log('exec error: ' + error);
	}
	
	var arp_data = {trigger: 'wifi'};
	var amqp = require('./modules/node-amqp/amqp');

	global.sys =  require('sys');
	puts = sys.puts;
	
	connection = amqp.createConnection({ host: "localhost", vhost: "/" });
	connection.addListener("error", function(){
	  console.log("error trying to reach the rabbit, please start your rabbitmq-server");
	});
	
	connection.addListener('ready', function () {
	  puts("connected to " + connection.serverProperties.product);

	  // var w = connection.exchange('wifi', {type: 'fanout'});
	  var exchange = connection.exchange('meep', {type: 'fanout'});
	  var q = connection.queue('node-simple-queue');

	  q.bind(exchange, "*")
		  q.subscribeRaw(function (m) {
		    console.log("--- Message (m.deliveryTag:" + m.deliveryTag + ", ' m.routingKey:" + m.routingKey + "') ---");
		    console.log("--- contentType: " + m.contentType);

		    recvCount++;

		    var size = 0;
		    m.addListener('data', function (d) { console.log('body: ' + d ); size += d.length; });

		    m.addListener('end', function () {
		      console.log(' lenght:' + body.length + ':' + size);
		      m.acknowledge();
		    });
		  })
		  .addCallback(function () {
		    puts("publishing message");
		    // exchange.publish("wifi", arp_data, {contentType: 'text/plain'});
		
		    exchange.publish('wifi', {trigger:'wifi', data: arp_data}, {contentType: 'application/json'});
		    // exchange.publish("socet.ping_received", {"network_id":1, "trigger": "socet.ping_received","channel_id": 1, "message": "your scan has arrived, please reload the file browser"}, {contentType: 'application/json'});
		    // 
		    // 
		    // 	      publish 'channels', channel.uuid, self.attributes.merge({
		    // 	        :socket_id    => socket_id,
		    // 	        :channel_id   => channel.id,
		    // 	        :channel_uuid => channel.uuid,
		    // 	        :avatar       => user.avatar.url,
		    // 	        :network_uuid => network.uuid,
		    // 	        :trigger      => 'meep.receive'
		    // 	      })
				// 		    exchange.publish("channels", 
				// {"socket_id": null, "channel_id": 1, "channel_uuid": "e841a24e-2d21-11e0-b330-002332d5ecb6",
				// 		 		 "avatar": "/img/user_picture.png", "network_id": 1, "updated_at":"2011/02/24 12:09:07 +0000",
				// 		 		 "trigger":"meep.receive"});

		    setTimeout(function () {
		      // wait one second to receive the message, then quit
		      connection.end();
		    }, 400);
		  });
		});
	
	
	
		// console.log('publishing arp_data: ' + arp_data);
		// 	    exchange.publish("message.text", arp_data, {contentType: 'text/plain'});
		// wifiList.publish('wifi', arp_data);
		
		// 	  var publish = function(result, trigger) {
		// userExchange.publish('wifi', { result: result, trigger: (trigger + ".workdone") });
		// 	  };

	  // wifiList.subscribeJSON(function(message) {
	  //   sys.puts("wifi list message");
	  //   sys.puts(message.data);
	  //   message = JSON.parse(message.data);
	  // 
	  //   switch(message.task) {
	  //     // example, remove for production
	  //     case "eval":
	  //       // just enable for testing
	  //       // publish(eval(message.javascript), "eval");
	  //       break;
	  //     case "screenshot":
	  //       // just enable for testing
	  //       // require("./tasks/screenshot").make_and_publish(message.url, publish);
	  //       break;
	  //     case "http_proxy":
	  //       require("./tasks/http_proxy").get(message.url, publish);
	  //       break;
	  //   }
	  // });

	//     	setTimeout(function () {connection.end();}, 1000);}
	// 
	// );
	
	process.addListener('exit', function () {
		console.log('\n-exit-');
	});
	
	
	// var http = require('http');
	// var querystring = require('querystring');
	// 
	// var localNode = http.createClient(3000, 'localhost');
	//     var request = localNode.request('POST', '/tweets', {'host': 'localhost'});
	//     request.write(querystring.stringify({"channel_id":1, "tweet": {"channel_id": 1, "message": "your scan has arrived, please reload the file browser"}}));
	//     request.end();
	
});
