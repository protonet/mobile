(function(protonet, undefined) {

  protonet.Channel = Class.create({
    initialize: function(data){
      this.id           = data.id;
      this.rendezvous   = data.rendezvous;
      if (data.rendezvous) {
        var rendezvousArr = data.rendezvous.split(":");
        if (protonet.config.user_id == +rendezvousArr[0]) {
          this.rendezvousId = +rendezvousArr[1];
        }else{
          this.rendezvousId = +rendezvousArr[0];
        }
        try{
          this.name = protonet.usersController.get(this.rendezvousId).name;
        }catch(e){
          this.name = "private-" + this.id;
        }
      }else{
        this.name = data.name;
      }
      this.description    = data.description;
      this.global         = data.global;
      this.uuid           = data.uuid;
      this.listenId       = data.listen_id;
  
      this.lastReadMeepId = this._lastReadMeepId(data.last_read_meep);

      this.loading        = undefined;
      this.lastMeep       = { id: -1 };
      this.meeps          = [];
      this.users          = $.map(protonet.usersController.getAll(), function(user, key){
        if (user.subscriptions.indexOf(this.id) !== -1) {
          return user;
        }else{
          return null;
        }
      }.bind(this));
      this._observe();
      protonet.trigger("channel.new", this);
    },
    _lastReadMeepId: function(id){
      var storedIds = protonet.storage.get("last_read_meeps");
      if (storedIds && storedIds[this.listenId]){
        if (storedIds[this.listenId] > id ) {
          id = storedIds[this.listenId]
        }
      }
      return id;
    },
    countUnreadMeeps: function(){
      var count = 0;
      for (var i = this.meeps.length - 1; i >= 0; i--) {
        if (this.meeps[i].id > this.lastReadMeepId) {
          count++;
        }
      }
      if (count > 9) { count = "9+" }
      return count;
    },
    hasUnreadMeeps: function(){
      return this.lastMeep.id > (this.lastReadMeepId || 0)
    },
    markAllAsRead: function(){
      this.lastReadMeepId = this.lastMeep.id;
      protonet.trigger("channel.updateLastReadMeeps", this);
    },
    loadMoreMeeps: function(callback){
      if (this.loading) { return ;}
      this.loading = $.ajax({
        url: "channels/" + this.id + "/meeps",
        type: "get",
        data:{
          limit: 10,
          offset: (this.meeps[0] && this.meeps[0].id) ||  null
        },
        success: function(data){
          for (var i = 0; i < data.length; i++) {
            new protonet.Meep(data[i])
          };
          this.loading = undefined;
          callback && callback(data); 
          protonet.trigger("channel.meepsLoaded", this, data);
        }.bind(this)
      });
    },
    isActive: function(){
      if (!this.rendezvous) { return true; };
      var activeRendezvous = protonet.storage.get("active_rendezvous");
      return activeRendezvous && activeRendezvous[this.id];
    },
    setActive: function(){
      var activeRendezvous = protonet.storage.get("active_rendezvous") || {};
      activeRendezvous[this.id] = true;
      protonet.storage.set("active_rendezvous", activeRendezvous);
      protonet.trigger("channel.new", this);
    },
    update: function(data){
      this.name         = data.name;
      this.description  = data.description;
      this.global       = data.global;
      this.uuid         = data.uuid;
      protonet.trigger("channel.update", this);
    },
    updateSubscriptions: function(userIds){
      for (var i = 0; i < userIds.length; i++) {
        var user = protonet.usersController.get(userIds[i]);
        if (this.users.indexOf(user) === -1) {
          this.users.push(user);
        };
        if (user.subscriptions.indexOf(this.id) === -1) {
          user.subscriptions.push(this.id);
        };
      };
    },
    destroy: function(){
      protonet.trigger("channel.destroy", this);
    },
    getMeep: function(a, b){
      return this.meeps.slice(a, b)[0];
    },
    getNextMeep: function(meep){
      var indexOfMeep = this.meeps.indexOf(meep);
      if (indexOfMeep + 1 == this.meeps.length) {
        return null
      }else{
        return this.meeps[indexOfMeep + 1];
      }
    },
    getPreviousMeep: function(meep){
      var indexOfMeep = this.meeps.indexOf(meep);
      if (indexOfMeep == 0) {
        return null
      }else{
        return this.meeps[indexOfMeep - 1];
      }
    },
    _observe: function(){
      protonet

        .on("meep.created."+ this.id, function(meep){
          if (meep.id > this.lastMeep.id) {
            this.meeps.push(meep);
            this.lastMeep = meep;
          }else{
            this.meeps.unshift(meep);
          }
        }.bind(this))

        .on("user.new", function(user){
          if (user.subscriptions.indexOf(this.id) !== -1) { 
            this.users.push(user);
          };
        }.bind(this))

        .on("user.subscribed_channel", function(data){
          if (data.channel === this.id) {
            var user = protonet.usersController.get(data.user_id);
            user && this.users.push(user);
          };
        }.bind(this))

        .on("user.unsubscribed_channel", function(data){
          if (data.channel_id === this.id) {
            var user = protonet.usersController.get(data.user_id);
            user && this.users.splice(this.users.indexOf(user), 1);
          };
        }.bind(this));

      if (!this.isActive()) {
        protonet.one("sync.succeeded channel.meepsLoaded", function(){
          protonet.one("meep.created."+ this.id, function(){
            this.setActive();
          }.bind(this));
        }.bind(this));
      }; 
    }
  });

})(protonet);

