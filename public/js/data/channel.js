(function(protonet) {

  protonet.channels = {};

  protonet.Channel = Class.create({
    initialize: function(data){
      this.id           = data.id;
      this.rendezvous   = data.rendezvous;
      if (data.rendezvous) {
        var rendezvousArr = data.rendezvous.split(":");
        if (protonet.config.user_id == +rendezvousArr[0]) {
          this.name = protonet.users[+rendezvousArr[1]].name;
          this.rendezvousId = +rendezvousArr[1];
        }else{
          this.name = protonet.users[+rendezvousArr[0]].name;
          this.rendezvousId = +rendezvousArr[1];
        }
      }else{
        this.name       = data.name;
      }
      this.description  = data.description;
      this.global       = data.global;
      this.uuid         = data.uuid;
      
      this.lastMeep     = null;
      this.meeps        = [];
      this._observe();
      protonet.trigger("channel.created", this);
    },
    update: function(data){
      this.name         = data.name;
      this.description  = data.description;
      this.global       = data.global;
      this.uuid         = data.uuid;
      protonet.trigger("channel.updated", this);
    },
    delete: function(){
      protonet.channels[id] = null;
      protonet.trigger("channel.deleted", this);
    },
    _observe: function(){
      protonet.on("meep.created."+ this.id, function(meep){
        this.meeps.push(meep);
        this.lastMeep = meep;
      }.bind(this));
    }
  });

  protonet.on("channel.updated", function(data){
    if (protonet.channels[data["id"]]) {
      protonet.channels[data["id"]].update(data);
    }else{
      var channel = new protonet.Channel(data);
      protonet.channels[channel.id] = channel;
    }
  });

})(protonet);

