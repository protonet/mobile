$(function() {

  $.ajax({
    url: "/channels/subscribed",
    type: "get",
    success: function(data){
      for (var i = data.length - 1; i >= 0; i--) {
        var id = +data[i]["id"];
        if (protonet.channels[id]) {
          protonet.channels[id].update(data[i]);
        }else{
          protonet.channels[id] = new protonet.Channel(data[i]);
        }        
      };
      protonet.trigger("channels.loaded");
    },
    error: function(){
      console.error(arguments);
    }
  });

  protonet.dashboard = new protonet.pages.Dashboard();

  protonet.dispatcher.initialize();

  protonet.on("channels.loaded", function(){
    protonet.dispatcher.onready(function(){
      protonet.trigger("socket.send", {
        operation:  "sync",
        payload:    {
          limit: 20
        }
      });
    });
  });

  protonet.on("sync.received", function(data){
    $.each(data['channels'], function(id, meeps){
      if(!protonet.channels[id]){
        protonet.channels[id] = new protonet.Channel(id);
      }
      $.each(meeps, function(i, meep){
        new protonet.Meep(meep);
      });
    });
    protonet.trigger("sync.succeeded")
  });

});
