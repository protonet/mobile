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
      this.lastReadMeepID = data.last_read_meep;
      this.listenId       = data.listen_id;
      this.loading        = undefined;
      this.lastMeep       = { id: -1 };
      this.meeps          = [];
      this._observe();
      protonet.trigger("channel.created", this);
    },
    countUnreadMeeps: function(){
      var count = 0;
      for (var i = this.meeps.length - 1; i > 0; i--) {
        if (this.meeps[i].id > this.lastReadMeepID) {
          count++;
        }
      }
      if (count > 9) { count = "9+" }
      return count;
    },
    hasUnreadMeeps: function(){
      return this.lastMeep.id > (this.lastReadMeepID || 0)
    },
    markAllAsRead: function(){
      this.lastReadMeepID = this.lastMeep.id;
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
    update: function(data){
      this.name         = data.name;
      this.description  = data.description;
      this.global       = data.global;
      this.uuid         = data.uuid;
      protonet.trigger("channel.updated", this);
    },
    destroy: function(){
      protonet.trigger("channel.destroy", this);
    },
    getMeep: function(a, b){
      return this.meeps.slice(a, b)[0];
    },
    _observe: function(){
      protonet.on("meep.created."+ this.id, function(meep){
        if (meep.id > this.lastMeep.id) {
          this.meeps.push(meep);
          this.lastMeep = meep;
        }else{
          this.meeps.unshift(meep);
        }
      }.bind(this));
    }
  });

})(protonet);

