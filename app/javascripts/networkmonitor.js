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
function asyncupdate() {
  console.log("async update");
  NetworkGraph.updateFromAsyncInfo({
    "20":{name:"new1"},
    "21":{name:"new2"}
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
    ourInterval = setInterval("NetworkGraph.render()", 100);
    //setTimeout("asyncupdate()", 2000);
  }
});

