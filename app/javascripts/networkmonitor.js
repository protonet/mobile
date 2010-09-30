//= require "lib/raphael-min.js"
//= require "lib/vertex.js"
//= require "lib/speechbubble.js"
//= require "lib/graphkit.js"

var NetworkGraph;
var ourInterval;

///////////////////////////////////////////////////////////////////

//console.log(networks.toSource());
/*
  name:"local", 
  created_at:"2010-06-14T18:25:42Z", 
  updated_at:"2010-08-12T09:04:32Z", 
  last_data_exchanged:null, 
  coupled:null, 
  id:1, 
  description:"your local node", 
  supernode:null, 
  key:null
*/
/*
function asyncupdate1() {
  console.log("async update 1");
  NetworkGraph.updateFromAsyncInfo({
    "20":{name:"#20"},
    "21":{name:"#21"},
    "22":{name:"#22"},
    "23":{name:"#23"},
    "24":{name:"#24"}
  });
}
function asyncupdate2() {
  console.log("async update 2");
  NetworkGraph.updateFromAsyncInfo({
    "21":{name:"#21"},
    "22":{name:"#22"},
    "23":{name:"#23"}
  });
}
function asyncupdate3() {
  console.log("async update 3");
  NetworkGraph.updateFromAsyncInfo({
    "20":{name:"#20"},
    "20":{name:"#20"},
    "24":{name:"#24"}
  });
}
function asyncupdate4() {
  console.log("async update 4");
  NetworkGraph.updateFromAsyncInfo({
    "20":{name:"#20"},
    "21":{name:"#21"},
    "22":{name:"#22"},
    "23":{name:"#23"},
    "24":{name:"#24"},
    "25":{name:"#25"},
    "26":{name:"#26"},
    "27":{name:"#27"},
    "28":{name:"#28"},
    "29":{name:"#29"},
    "30":{name:"#30"}
  });
}
*/

$(function() {
  if ($("network-monitor")) {
    // make graph and render it
    NetworkGraph = new Graph("network-monitor", 50, ($('.side #network-monitor').size() > 0));
    NetworkGraph.initFromNetworksInfo(networks);
    protonet.Notifications.bind('users.update_status', function(e, msg) {
      NetworkGraph.updateFromAsyncInfo(msg.online_users);
    }.bind(this));
    NetworkGraph.render();
    //ourInterval = setInterval("NetworkGraph.render()", 50);
    //setTimeout("asyncupdate1()", 1000);
    //setTimeout("asyncupdate2()", 2000);
    //setTimeout("asyncupdate3()", 3000);
    //setTimeout("asyncupdate4()", 1000);
  }
});

