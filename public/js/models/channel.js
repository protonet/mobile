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
        this.name = protonet.usersController.get(this.rendezvousId).name;
      }else{
        this.name       = data.name;
      }
      this.description  = data.description;
      this.global       = data.global;
      this.uuid         = data.uuid;
      
      this.lastMeep     = { id: -1 };
      this.meeps        = [];
      this._observe();
      protonet.trigger("channel.created", this);
    },
    loadMoreMeeps: function(data){
      $.ajax({
        url: "/channels/" + this.id + "/meeps",
        type: "get",
        data:{
          limit: 10,
          offset: this.lastMeep.id
        },
        success: function(data){
          for (var i = 0; i < data.length; i++) {
            new protonet.Meep(data[i])
          };
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
    delete: function(){
      protonet.trigger("channel.deleted", this);
    },
    _observe: function(){
      protonet.on("meep.created."+ this.id, function(meep){
        this.meeps.push(meep);
        this.lastMeep = meep;
      }.bind(this));
    }
  });

})(protonet);

