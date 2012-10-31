(function(protonet, undefined){

  protonet.User = Class.create({
    initialize: function(data){
      this.id     = data.id;
      this.name   = data.name;
      this.avatar = data.avatar;
      if (data.subscriptions) {
        this.subscriptions = data.subscriptions;
      }else{
        this.subscriptions = $.map(data.subscribed_channel_ids, function(uuid){
          var channel = protonet.channelsController.getByUuid(uuid);
          if (channel) { return channel.id } 
        });
      }
      protonet.trigger("user.new", this);
    },
    avatar: function(dimensions){
      protonet.utils.ImageProxy.getImageUrl(this.avatar, dimensions);
    }
  });

})(protonet);