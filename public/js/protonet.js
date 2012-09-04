$(function() {

  $window.one("load", function(event){
    setTimeout(function(){
      window.scrollTo(0,1);
    }, 0);
  });

  for (var i = data.users.length - 1; i >= 0; i--) {
    var user = new protonet.User(data.users[i]);
    if (user.id != protonet.config.user_id) {
      protonet.users[user.id] = user;
    };
  };

  for (var i = data.channels.length - 1; i >= 0; i--) {
    var channel = new protonet.Channel(data.channels[i]);
    protonet.channels[channel.id] = channel;
  };

  data = null;
  $('#data').remove();

  protonet.dispatcher.onready(function(){
    protonet.trigger("socket.send", {
      operation:  "sync",
      payload:    {
        limit: 20
      }
    });
  });

  protonet.dashboard = new protonet.pages.Dashboard();
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
