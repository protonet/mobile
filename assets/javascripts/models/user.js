(function(protonet, undefined){

  protonet.User = Class.create({
    initialize: function(data){
      this.id         = +data.id;
      this.name       = data.name;
      this.avatar_url = data.avatar_url;
    },
    avatar: function(dimensions){
      protonet.media.Proxy.getImageUrl(this.avatar_url, dimensions);
    }
  });

})(protonet);