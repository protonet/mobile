//-= require "lib/jquery-ui-1.7.2.custom.min.js"
//-= require "dispatching/dispatching_system.js"
//-= require "networkmonitor.js"

//= require "dispatcher/dispatcher.js"
//= require "timeline/timeline.js"
//= require "effects/clouds.js"
//= require "controls/pretty_date.js"
//= require "controls/fluid.js"
//= require "networkmonitor.js"

// Initialize communication stuff
$(function() {
  protonet.dispatcher.initialize();
  //protonet.globals.dispatcher = new protonet.dispatching.DispatchingSystem();
});

/////////////////////////////////

$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  $("#network li").click(function(event){
    networkId = this.id.match(/network-(.*)/)[1];
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
  
  $('#new-network-form').submit(function(event){
    protonet.globals.dispatcher.sendJSON({
      "operation": "network.probe",
      "supernode": $("#network_supernode").attr("value")
    })
    
    $("#network-details").html("Loading channel list...");
    $("#create").slideUp("medium");
    
    event.stopPropagation();
    event.preventDefault();
  })
  
  protonet.Notifications.bind('network.probe', function(e, msg) {
    var html = "<h3>Please select channels to couple from remote node.</h3>";
    html += "<form id='create-network-form'>";
    html += "<ul id='channel-picker'>";
    
    for (var uuid in msg.channels) {
      var chan = msg.channels[uuid];
      
      html += "<li><input type='checkbox' id='channel_" + uuid + "' name='channel_uuid' value='" + uuid + "' />";
      html += "<label for='channel_" + uuid + "'>" + chan.name + "</label></li>";
    }
    
    html += "</ul><input type='submit' value='Couple' /></form>";
    form = $("#network-details").html(html).find('#create-network-form');
    
    form.submit(function(event){
      var uuids = new Array();
      $("input:checkbox[name=channel_uuid]:checked").each(
        function(){ uuids.push(this.value); }
      );
      
      protonet.globals.dispatcher.sendJSON({
        "operation": "network.create",
        "name": $("#network_name").attr("value"),
        "description": $("#network_description").attr("value"),
        "supernode": $("#network_supernode").attr("value"),
        "channels": uuids
      })
      
      $("#network-details").html("Waiting for local node...");
      
      event.stopPropagation();
      event.preventDefault();
    });
  });
  
  // network creation in progress
  protonet.Notifications.bind('network.creating', function(e, msg) {
    $("#network-details").html(msg.message);
  });
  
  // network creation complete
  protonet.Notifications.bind('network.create', function(e, msg) {
    $("#network-details").load("/networks/" + msg.id);
  });
});
