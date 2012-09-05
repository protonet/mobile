(function(protonet, undefined) {

  var users      = {},
      usersCache = [];

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
    
    _observe: function(){

    }
  });

})(protonet);