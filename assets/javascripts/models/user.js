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
      this._observe();
      protonet.trigger("user.new", this);
    },
    avatar: function(dimensions){
      protonet.utils.ImageProxy.getImageUrl(this.avatar, dimensions);
    },
    destroy: function(){
      protonet.trigger("user.destroy", this);
    },
    _observe: function(){
      protonet
        
        .on("user.subscribed_channel", function(data){
          if (data.user_id === this.id) {
            this.subscriptions.push(data.channel_id);
            if (data.user_id === protonet.currentUser.id) {
              protonet.channelsController.get(data.channel_id);
            };
          }
        }.bind(this))

        .on("user.unsubscribed_channel", function(data){
          if (data.user_id === this.id) {
            this.subscriptions.splice(this.subscriptions.indexOf(data.channel_id), 1);
            if (this.subscriptions.length === 0) {
              this.destroy();
            };
            if (data.user_id === protonet.currentUser.id) {
              protonet.channelsController.get(data.channel_id).destroy();
            };
          };
        }.bind(this));
    }
  });

})(protonet);