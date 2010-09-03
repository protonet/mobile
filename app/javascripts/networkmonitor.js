//= require "lib/raphael-min.js"
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
    "20":{name:"new"},
    "21":{name:"abcd"},
    "22":{name:"stranger"},
    "23":{name:"abcdef"},
    "24":{name:"abcdefg"}
  });
}
function asyncupdate2() {
  console.log("async update 2");
  NetworkGraph.updateFromAsyncInfo({
    "24":{name:"new-one"},
    "25":{name:"abcdefg"}
  });
}
function asyncupdate3() {
  console.log("async update 3");
  NetworkGraph.updateFromAsyncInfo({
    "25":{name:"new-one-2"},
    "26":{name:"foobar"}
  });
}
*/

$(function() {
  if ($("network-monitor")) {
    // make graph and render it
    NetworkGraph = new Graph("network-monitor", 50, ($('.side #network-monitor').size() > 0));
    NetworkGraph.initFromNetworksInfo(networks);
    protonet.Notifications.bind('user.update_online_states', function(e, msg) {
      NetworkGraph.updateFromAsyncInfo(msg.online_users);
    }.bind(this));
    ourInterval = setInterval("NetworkGraph.render()", 50);
    //setTimeout("asyncupdate1()", 1000);
    //setTimeout("asyncupdate2()", 2000);
    //setTimeout("asyncupdate3()", 3000);
  }
});

