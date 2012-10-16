$(function() {

  $window.one("load", function(event){
    setTimeout(function(){
      window.scrollTo(0,1);
    }, 0);
  });

  var showHeaderTimeout;
  $document
    .delegate('.meep_form textarea',{
      'focus': function(){
        showHeaderTimeout && clearTimeout(showHeaderTimeout);
        $('.channel-page .ui-header').css({
          position:'absolute'
        });
      },
      'blur': function(){
        showHeaderTimeout = setTimeout(function(){
          $('.channel-page .ui-header').css({
            position:'fixed'
          });
        }, 0);
      }
    })
    .bind("mobileinit", function(){
      $.mobile.minScrollBack = 'infinity';
    });



  protonet.utils.mobile.disableZoomOnFocus();

  protonet.usersController = new protonet.UsersController(data.users);
  protonet.channelsController = new protonet.ChannelsController(data.channels);
  protonet.dashboard = new protonet.pages.Dashboard();

  protonet.ui.FlashMessage.initialize();
  protonet.dispatcher.initialize();

  protonet.dispatcher.onready(function(){
    protonet.trigger("socket.send", {
      operation:  "sync",
      limit: 10
    });
  });

  protonet.on("socket.reconnected", function(){
    protonet.trigger("socket.send", {
      operation:  "sync",
      limit: 10,
      channel_states: protonet.storage.get("channel_states")
    });
  });
  
  protonet.on("sync.received", function(data){
    $.each(data['channels'], function(id, meeps){
      // TODO: handle add/remove of Channels if user came back online
      $.each(meeps.reverse(), function(i, meep){
        new protonet.Meep(meep);
      });
    });
    protonet.trigger("sync.succeeded");
  });

});
