(function(protonet, undefined) {

  var channels         = {},
      fetchingChannels = {},
      uuidToIdMapping  = {};

  protonet.ChannelsController = Class.create({
    initialize: function(data){
      for (var i = data.length - 1; i >= 0; i--) {
        var channel = new protonet.Channel(data[i]);
        channels[channel.id] = channel;
        uuidToIdMapping[channel.uuid] = channel.id;
      };

      this._observe();
    },
    get: function(id){
      if (fetchingChannels[id]) { return }
      if (channels[id]) { return channels[id] }
      fetchingChannels[id] = $.ajax({
        url: "channels/" + id,
        type: "get",
        success: function(data){
          if (channels[data.id]) { return; };
          channels[data.id] = new protonet.Channel(data);
          channels[data.id].loadMoreMeeps();
          delete fetchingChannels[id];
        }.bind(this)
      });
    },
    getByUuid: function(uuid){
      id = uuidToIdMapping[uuid];
      if (id) { return this.get(id) };
    },
    getAll: function(){
      return $.map(channels, function(value, key){
        return value;
      });
    },
    getRealChannels: function(){
      return $.map( channels, function(channel, key) {
        return channel.rendezvousId ? null : channel;
      });
    },
    getRendezvous: function(){
      return $.map( channels, function(channel, key) {
        return channel.rendezvousId ? channel : null;
      });
    },
    findOrCreateRendezvous: function(userId, callback){
      var rendezvous = this.getRendezvous();
      for (var i = 0; i < rendezvous.length; i++) {
        if (rendezvous[i].rendezvousId == userId) {
          callback(rendezvous[i]);
          return
        };
      };
      
      $.ajax({
        url: "rendezvous",
        type: "post",
        data: {
          user_id: userId
        },
        success: function(data){
          if (data.channel_id) {
            callback(channels[data.channel_id]);
          }else{
            console.err(data);
          }
        }
      });
    },
    _observe: function(){
      protonet
        .on("channel.created", function(data){
          var channel = new protonet.Channel(data);
          channels[channel.id] = channel;
        }.bind(this))
        .on("channel.new", function(channel){
          uuidToIdMapping[channel.uuid] = channel.id;
        }.bind(this))
        .on("channel.updated", function(data){
          var id = +data["id"];
          if (channels[id]) {
            channels[id].update(data);
          }else{
            channels[id] = new protonet.Channel(data);
          }
        }.bind(this))

        .on("channel.load", function(data){
          this.get(data.channel_id);
        }.bind(this))

        .on("user.subscribed_channel", function(data){
          var user    = protonet.usersController.get(data.user_id),
              channel = this.get(data.channel_id);
          user && channel && channel.users.push(user);
        }.bind(this))

        .on("user.unsubscribed_channel", function(data){
          if (data.user_id == protonet.currentUser.id) {
            channels[data.channel_id] && channels[data.channel_id].destroy();
            delete channels[data.channel_id];
          }else{
            var user    = protonet.usersController.get(data.user_id),
                channel = this.get(data.channel_id),
                index   = channl.users.indexOf(user);
            if (index !== -1 ) {
              channel.users.splice(index, 1);
            }
          }
        }.bind(this))
    }
  });



})(protonet);