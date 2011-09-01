//= require "../ui/context_menu.js"

protonet.user = {
  data: {
    name:                   protonet.config.user_name,
    id:                     +protonet.config.user_id,
    is_admin:               protonet.config.user_is_admin,
    is_stranger:            protonet.config.user_is_stranger,
    subscribed_channel_ids: protonet.config.user_channel_ids,
    avatar:                 protonet.config.user_icon_url,
    session_id:             protonet.config.session_id,
    authenticity_token:     protonet.config.authenticity_token
  },
  
  initialize: function() {
    this.usersData = {};
    
    protonet.user.Config.initialize();
    
    this._observe();
    this._createContextMenu();
    
    protonet.trigger("user.data_available", this.data);
  },
  
  _observe: function() {
    /**
     * Highlight meep when sent by current user
     */
    protonet
      .bind("meep.rendered", function(e, element, data, instance) {
        if (data.author == this.data.name && !instance.merged) {
          element.addClass("own");
        }
      }.bind(this))
    
      .bind("users.data_available", function(event, usersData) {
        this.usersData = usersData;
      }.bind(this));
  },
  
  _createContextMenu: function() {
    // TODO: One day we should combine the context menu logic with our behaviors. FO SHIZZLE.
    // By the way: "Taylor Swift - The Best Day" is a really good song.
    // U have to check it out http://grooveshark.com/#/s/The+Best+Day/2fZAWg
    // kkthxbai
    var contextOptions = {
      "show profile": function(link, closeContextMenu) {
        if (protonet.config.allow_modal_views) {
          protonet.globals.pages.user.show(+link.data("user-id"));
        } else {
          window.open(link.attr("href"), "profile" + new Date().getTime());
        }
        closeContextMenu();
      }.bind(this),
      "send @reply": function(link, closeContextMenu) {
        var user = this.usersData[+link.data("user-id")] || (function() {
          var meep = link.parents("article").data("meep");
          return meep && { name: meep.author };
        })();
        if (user) {
          protonet.trigger("form.create_reply", user.name);
        }
        closeContextMenu();
      }.bind(this),
      "start private chat": function(link, closeContextMenu) {
        protonet.trigger("rendezvous.start", +link.data("user-id"));
        closeContextMenu();
      }.bind(this)
    };
    
    var contextMenu = new protonet.ui.ContextMenu("[data-user-id]", contextOptions, "context-menu-users");
  },
  
  getUser: function(userId) {
    var user = this.usersData[+userId];
    return user;
  }
};

//= require "browser.js"
//= require "config.js"