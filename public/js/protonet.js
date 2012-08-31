$(function() {

  $window.one("load", function(event){
    setTimeout(function(){
      window.scrollTo(0,1);
    }, 0);
  });

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
      protonet.dispatcher.onready(function(){
        protonet.trigger("socket.send", {
          operation:  "sync",
          payload:    {
            limit: 20
          }
        });
      });
    }
  });

  protonet.navigation = new protonet.pages.Navigation();
  protonet.dispatcher.initialize();

  protonet.on("sync.received", function(data){
    $.each(data['channels'], function(id, meeps){
      $.each(meeps.reverse(), function(i, meep){
        new protonet.Meep(meep);
      });
    });
    protonet.trigger("sync.succeeded");
  });

});
