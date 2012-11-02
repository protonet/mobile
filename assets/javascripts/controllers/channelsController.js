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
        url: "/mobile/channels/" + id,
        type: "get",
        success: function(data){
          channels[data.id] = new protonet.Channel(data);
          channels[data.id].loadMoreMeeps();
          delete fetchingChannels[id];
        }
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
        //.on("channel.created", function(data){
        //  var channel = new protonet.Channel(data);
        //  channels[channel.id] = channel;
        //}.bind(this))

        .on("channel.new", function(channel){
          uuidToIdMapping[channel.uuid] = channel.id;
        }.bind(this))

        .on("channel.destroy", function(channel){
          delete channels[channel.id];
          delete uuidToIdMapping[channel.uuid];
        }.bind(this))

        .on("channel.updated", function(data){
          var id = +data["id"];
          if (protonet.currentUser.subscriptions.indexOf(id) !== -1) {
            if (channels[id]) {
              channels[id].update(data);
            }else{
              this.get(data.id);
            }
          };
          
        }.bind(this))

        .on("channels.update_subscriptions", function(obj){
          var data = obj["data"];
          for(uuid in data){
            var channel = this.getByUuid(uuid);
            if (channel) {
              channel.updateSubscriptions(data[uuid]);
            }else{
              protonet.one("channel.new", function(channel){
                channel.updateSubscriptions(data[uuid]);
              })
            }
          }
        }.bind(this));
    }
  });



})(protonet);