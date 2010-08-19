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
  protonet.Notifications.bind('user.update_online_states', function(e, msg) {
    NetworkGraph.updateFromAsyncInfo(msg.online_users);
  }.bind(this));
  ourInterval = setInterval("NetworkGraph.render()", 50);

  /*var n1 = new Node(1);
  var n2 = new Node(2);
  var n3 = new Node(3);
  var n4 = new Node(4);
  var n5 = new Node(5);
  var n6 = new Node(6);
  var n7 = new Node(7);
  var n8 = new Node(8);

  var e1 = new Edge(n1, n2);
  var e2 = new Edge(n2, n3);
  var e3 = new Edge(n3, n4);
  var e4 = new Edge(n4, n5);
  var e5 = new Edge(n5, n6);
  var e6 = new Edge(n6, n7);
  var e7 = new Edge(n7, n8);
  var e8 = new Edge(n8, n1);
  var e9 = new Edge(n8, n2);
  var e10 = new Edge(n8, n3);
  var e11 = new Edge(n8, n4);*/
  
  /*NetworkGraph.addNode(n1);
  NetworkGraph.addNode(n2);
  NetworkGraph.addNode(n3);
  NetworkGraph.addNode(n4);
  NetworkGraph.addNode(n5);
  NetworkGraph.addNode(n6);
  NetworkGraph.addNode(n7);
  NetworkGraph.addNode(n8);
  NetworkGraph.addEdge(e1, false);
  NetworkGraph.addEdge(e2, false);
  NetworkGraph.addEdge(e3, false);
  NetworkGraph.addEdge(e4, false);
  NetworkGraph.addEdge(e5, false);
  NetworkGraph.addEdge(e6, false);
  NetworkGraph.addEdge(e7, false);
  NetworkGraph.addEdge(e8, false);
  NetworkGraph.addEdge(e9, false);
  NetworkGraph.addEdge(e10, false);
  NetworkGraph.addEdge(e11, false);*/  
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


