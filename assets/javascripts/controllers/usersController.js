(function(protonet, undefined) {

  var users      = {},
      usersCache = [],
      updateLastReadTimeout;

  protonet.UsersController = Class.create({
    initialize: function(data){
      for (var i = 0; i < data.length; i++) {
        var user = new protonet.User(data[i]);
        users[user.id] = user;

        if ( user.id === protonet.config.user_id ) {
          protonet.currentUser = user;
        };
      };
      this._observe();
    },
    getAll: function(){
      if (usersCache.length) { return usersCache };
      usersCache = $.map(users, function(value, key){
        return value;
      });
      return usersCache;
    },
    expireCache: function(){
      usersCache = [];
    },
    get: function(id){
      return users[id];
    },
    updateLastReadMeeps: function(){
      var oldLastReadMeeps = protonet.storage.get("last_read_meeps"),
          newLastReadMeeps = {},
          channels         = protonet.channelsController.getAll();

      $.each(channels, function(i, channel) {
        newLastReadMeeps[channel.listenId] = channel.lastReadMeepId;
      });

      if (JSON.stringify(oldLastReadMeeps) === JSON.stringify(newLastReadMeeps)) { 
        return; 
      }
      protonet.storage.set("last_read_meeps", newLastReadMeeps);

      if (updateLastReadTimeout) {
        clearTimeout(updateLastReadTimeout);
      };

      updateLastReadTimeout = setTimeout(function(){
        $.ajax({
          async:  false,
          url:    "/mobile/users/update_last_read_meeps",
          type:   "POST",
          data:   {
            mapping: newLastReadMeeps
          }
        });
      }, 20000);
    },
    
    _observe: function(){

      protonet
        .on("channel.updateLastReadMeeps", function(channel){
          this.updateLastReadMeeps();
        }.bind(this));
    }
  });

})(protonet);