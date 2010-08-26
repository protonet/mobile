//= require "lib/raphael-min.js"
//= require "lib/graphkit.js"
//= require "lib/jquery-ui-1.7.2.custom.min.js"
//= require "dispatching/dispatching_system.js"

var NetworkGraph;
var ourInterval;

// Initialize communication stuff
$(function() {
  protonet.globals.dispatcher = new protonet.dispatching.DispatchingSystem();
});

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

$(function() {
  // make graph and render it
  NetworkGraph = new Graph("network-monitor", 50);
  NetworkGraph.initFromNetworksInfo(networks);
  
  /*
  NetworkGraph.updateFromAsyncInfo({
    "1":{name:"client #1", supernode:null},
    "2":{name:"client #2", supernode:null},
    "3":{name:"client #3", supernode:null},
    "4":{name:"client #4", supernode:null},
    "5":{name:"client #5", supernode:null},
  });
  */
  
  protonet.Notifications.bind('user.update_online_states', function(e, msg) {
    NetworkGraph.updateFromAsyncInfo(msg.online_users);
  }.bind(this));
  ourInterval = setInterval("NetworkGraph.render()", 50);
});

/////////////////////////////////

$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  $("#network li").click(function(event){
    networkId = this.id.match(/network-(.*)/)[1];
    $.getJSON("/networks/"+networkId+"/map", 
      function(data){
        
      }
    );
    $("#network-details").load("/networks/" + networkId);
    $("#network li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
  });
  if(location.hash) {
    $("#network-" + location.hash.substring(1)).click();
  } else {
    $("#network li:first").click();
  }
  $("#network .control a").click(function(e){
    $.ajax({
      url: this.href,
      data: {},
      success: function(data) {
        $(e.currentTarget).removeClass("off");
        $(e.currentTarget).addClass("on");
     },
      error: function() {
        console.log('error')
      }
    });
    return false;
  });
});

$(function() {
  $("#network li:first").click()
});


