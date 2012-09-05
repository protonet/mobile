(function(protonet, undefined){

  protonet.Meep = Class.create({
    initialize: function(data){
      this.id         = +data.id;
      this.channel_id = +data.channel_id;
      this.author     = data.author;
      this.avatar     = data.avatar;
      this.created_at = data.created_at;
      this.message    = data.message;
      this.user_id    = data.user_id;
      protonet.trigger("meep.created."+this.channel_id, this);
    }
  });

  protonet.on("meep.receive", function(data){
    new protonet.Meep(data);  
  });

})(protonet);