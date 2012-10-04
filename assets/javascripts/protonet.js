$(function() {

  $window.one("load", function(event){
    setTimeout(function(){
      window.scrollTo(0,1);
    }, 0);
  });

  $document.delegate('input, textarea',{
    'focus': function(){
      $('.channel-page .ui-header').css({
        position:'absolute'
      });
    },
    'blur': function(){
      $('.channel-page .ui-header').css({
        position:'fixed'
      });
    }
  });
  
  // try to workarount this 300ms
  // 
  //$document.delegate('a', 'vmouseup', function(event){
  //  event.preventDefault();
  //  event.stopImmediatePropagation();
  //  $(this).trigger("click");
  //});


  protonet.utils.mobile.disableZoomOnFocus();

  protonet.usersController = new protonet.UsersController(data.users);
  protonet.channelsController = new protonet.ChannelsController(data.channels);

  protonet.dashboard = new protonet.pages.Dashboard();
  protonet.dispatcher.initialize();

  protonet.dispatcher.onready(function(){
    protonet.trigger("socket.send", {
      operation:  "sync",
      limit: 10
    });
  });

  protonet.on("sync.received", function(data){
    $.each(data['channels'], function(id, meeps){
      $.each(meeps.reverse(), function(i, meep){
        new protonet.Meep(meep);
      });
    });
    protonet.trigger("sync.succeeded");
  });

});
