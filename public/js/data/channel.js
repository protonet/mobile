(function(protonet) {

  protonet.Channel = Class.create({
    initialize: function(data){
      this.id = data.id;
      this.name = data.name;
      this.description = data.description;
      this.global = data.global;
      this.uuid = data.uuid;
      this.lastMeep = null;
      this.meeps = [];
      this._observe();
      protonet.trigger("channel.created", this);
    },
    update: function(data){
      this.name = data.name;
      this.description = data.description;
      this.global = data.global;
      this.uuid = data.uuid;
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

})(protonet);

