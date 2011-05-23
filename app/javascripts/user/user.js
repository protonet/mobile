//= require "../ui/context_menu.js"

protonet.user = {
  data: {
    name:                   protonet.config.user_name,
    id:                     Number(protonet.config.user_id),
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
    
    protonet.Notifications.trigger("user.data_available", this.data);
  },
  
  _observe: function() {
    /**
     * Highlight meep when sent by current user
     */
    protonet.Notifications
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
      "send reply": function(link, closeContextMenu) {
        var user = this.usersData[+link.attr("data-user-id")];
        if (user) {
          protonet.Notifications.trigger("form.create_reply", user.name);
          closeContextMenu();
        }
      }.bind(this),
      '<a>show profile</a>': $.noop
    };
    
    if(protonet.user.data.is_admin) {
      contextOptions["give internet access"] = function(link, closeContextMenu) {
        var user = this.usersData[+link.attr("data-user-id")];
        // todo add a && user.stranger()
        if (user) {
          protonet.Notifications.trigger("system.give_internet_access", user);
          closeContextMenu();
        }
      }.bind(this);
    }
    
    var contextMenu = new protonet.ui.ContextMenu("[data-user-id]", contextOptions);
    contextMenu.bind("open", function(e, link) {
      contextMenu.list.find("li > a").attr("href", "/users/" + link.attr("data-user-id"));
    });
  },
  
  getUserName: function(userId) {
    var user = this.usersData[+userId];
    return user && user.name;
  }
};

//= require "browser.js"
//= require "config.js"