(function(protonet, undefined) {

  var channels         = {},
      channelsCache    = [],
      rendezvousCache  = [],
      fetchingChannels = {};

  protonet.ChannelsController = Class.create({
    initialize: function(data){
      for (var i = data.length - 1; i >= 0; i--) {
        var channel = new protonet.Channel(data[i]);
        channels[channel.id] = channel;
      };
      this._observe();
    },
    get: function(id){
      if (fetchingChannels[id] || channels[id]) { return };
      fetchingChannels[id] = $.ajax({
        url: "channels/" + id,
        type: "get",
        success: function(data){
          if (channels[data.id]) { return; };
          channels[data.id] = new protonet.Channel(data);
          channels[data.id].loadMoreMeeps();
          this.expireCache();
          delete fetchingChannels[id];
        }.bind(this)
      });
    },
    getAll: function(){
      return $.makeArray(channels);
    },
    expireCache: function(){
      channelsCache = rendezvousCache = [];
      protonet.trigger("channel.cacheExpired");
    },
    getRealChannels: function(){
      if (channelsCache.length) { return channelsCache };
      channelsCache = $.map( channels, function(channel, key) {
        return channel.rendezvousId ? null : channel;
      });
      return channelsCache;
    },
    getRendezvous: function(){
      if (rendezvousCache.length) { return rendezvousCache; };
      rendezvousCache = $.map( channels, function(channel, key) {
        return channel.rendezvousId ? channel : null;
      });
      return rendezvousCache;
    },

    findOrCreateRendezvous: function(userId, callback){

      for (var i = 0; i < rendezvousCache.length; i++) {
        if (rendezvousCache[i].rendezvousId == userId) {
          callback(rendezvousCache[i]);
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
      protonet.
      on("channel.updated", function(data){
        var id = +data["id"];
        if (channels[id]) {
          channels[id].update(data);
        }else{
          channels[id] = new protonet.Channel(data);
          this.expireCache();
        }
      }.bind(this)).
      on("channel.load", function(data){
        this.get(data.channel_id);
      }.bind(this)).
      on("user.unsubscribed_channel", function(data){
        //channel_id: 7
        //channel_uuid: "da0fe7b0-f5a9-11e1-9b1b-83ae7237165c"
        //rendezvous: true
        //trigger: "user.unsubscribed_channel"
        //user_id: 8
        if (data.user_id == protonet.currentUser.id) {
          channels[data.channel_id] && channels[data.channel_id].destroy();
          delete channels[data.channel_id];
          this.expireCache();
        };
      }.bind(this));
    }
  });



})(protonet);