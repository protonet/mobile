protonet.user = {
  data: {
    name:                   protonet.config.user_name,
    id:                     Number(protonet.config.user_id),
    subscribed_channel_ids: protonet.config.user_channel_ids,
    avatar:                 protonet.config.user_icon_url,
    session_id:             protonet.config.session_id,
    authenticity_token:     protonet.config.authenticity_token
  },
  
  initialize: function() {
    this.Config.initialize();
    this._observe();
    
    protonet.Notifications.trigger("user.data_available", this.data);
  },
  
  _observe: function() {
    /**
     * Highlight meep when sent by current user
     */
    protonet.Notifications.bind("meep.rendered", function(e, element, data, instance) {
      if (data.author == this.data.name && !instance.merged) {
        element.addClass("own");
      }
    }.bind(this));
    
  }
};

//= require "browser.js"
//= require "config.js"