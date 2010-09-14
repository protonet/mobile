//= require "../ui/context_menu.js"

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
    this.usersData = {};
    
    this.Config.initialize();
    this._observe();
    this._createContextMenu();
    
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
    
    protonet.Notifications.bind("users.data_available", function(event, usersData) {
      this.usersData = usersData;
    }.bind(this));
  },
  
  _createContextMenu: function() {
    new protonet.ui.ContextMenu("[data-user-id]", {
      "holla at him/her": function(link, closeContextMenu) {
        var user = this.usersData[+link.attr("data-user-id")];
        
        if (user) {
          protonet.Notifications.trigger("form.create_reply", user.name);
          closeContextMenu();
        }
      }.bind(this),
      "show profile": function() {
        alert("Sorry, profiles are not available yet ...");
      }
    });
  }
};

//= require "browser.js"
//= require "config.js"