//= require "lib/jquery-ui-1.7.2.custom.min.js"
//= require "dispatching/dispatching_system.js"
//= require "networkmonitor.js"

// Initialize communication stuff
$(function() {
  protonet.globals.dispatcher = new protonet.dispatching.DispatchingSystem();
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
      "operation": "test",
      "name": $("#network_name").attr("value"),
      "description": $("#network_description").attr("value"),
      "supernode": $("#network_supernode").attr("value")
    })
    
    $("#network-details").html("Loading channel list...");
    $("#create").slideUp("medium");
    
    event.stopPropagation();
    event.preventDefault();
  })
  
  protonet.Notifications.bind('network.fetch_channels', function(e, msg) {
    var html = "<h3>Please select channels to couple from remote node.</h3>";
    html += "<ul id='channel-picker'>";
    
    var chans = msg.channels;
    for (var i=0; i<chans.length; i++) {
      var chan = chans[i];
      
      html += "<li><input type='checkbox' id='channel_" + chan.uuid + "' name='channel_uuid' value='" + chan.uuid + "' />";
      html += "<label for='channel_" + chan.uuid + "'>" + chan.name + "</label></li>";
    }
    
    $("#network-details").html(html + "</ul>");
  });
});
