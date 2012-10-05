(function(protonet, undefined){

  protonet.Meep = Class.create({
    initialize: function(data){
      this.id         = +data.id;
      this.channel_id = +data.channel_id;
      this.author     = data.author;
      this.avatar     = data.avatar;
      this.created_at = new Date(data.created_at);
      this.message    = parse(data.message);
      this.user_id    = data.user_id;
      this.text_extension = data.text_extension;
      protonet.trigger("meep.created."+this.channel_id, this);
      updateChannelStates(this);
    }
  });

  function updateChannelStates(meep){
    var channelStates = protonet.storage.get("channel_states") || {};
    channelStates[meep.channel_id] = meep.id;
    protonet.storage.set("channel_states", channelStates);
  };

  function parse(message){
    $.each([
      // Order of functions is essential!
      protonet.utils.escapeHtml,
      protonet.utils.quotify,
      protonet.utils.codify,
      protonet.utils.textify,
      protonet.utils.smilify,
      protonet.utils.heartify,
      protonet.utils.emojify,
      protonet.utils.autoLink
    ], function(i, method) {
      message = method(message);
    });
    return message;
  }

  protonet.on("meep.receive", function(data){
    new protonet.Meep(data);  
  });

})(protonet);