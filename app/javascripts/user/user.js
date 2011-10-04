//= require "../ui/context_menu.js"

protonet.user = {
  initialize: function() {
    this.usersData = {};
    
    protonet.user.Config.initialize();
    protonet.user.initGettingStarted();
    
    this._observe();
    this._createContextMenu();
  },
  
  _observe: function() {
    /**
     * Highlight meep when sent by current user
     */
    protonet
      .bind("meep.rendered", function(e, element, data, instance) {
        if (data.author == protonet.config.user_name && data.user_id == protonet.config.user_id && !instance.merged) {
          element.addClass("own");
        }
      }.bind(this))
      
      .bind("users.data_available", function(event, usersData) {
        this.usersData = usersData;
      }.bind(this))
      
      .bind("user.changed_avatar", function(e, data) {
        // timeout needed since the server needs to first move the avatar to the correct location
        setTimeout(function() {
          var selector = [];
          selector.push("a[data-user-id='" + data.user_id + "'] img");
          if (data.user_id == protonet.config.user_id) {
            selector.push("img[data-my-avatar]")
          }
          selector = selector.join(",");
          $(selector).toArray().chunk(function(img) {
            var $img       = $(img),
                dimensions = { width:  $img.width(), height: $img.height() },
                avatar = protonet.media.Proxy.getImageUrl(data.avatar, dimensions);
            if ($img.attr("data-src")) {
              $img.attr("data-src", avatar);
            } else {
              $img.attr("src", avatar);
            }
          });
        }, 1000);
      });
  },
  
  _createContextMenu: function() {
    // TODO: One day we should combine the context menu logic with our behaviors. FO SHIZZLE.
    // By the way: "Taylor Swift - The Best Day" is a really good song.
    // U have to check it out http://grooveshark.com/#/s/The+Best+Day/2fZAWg
    // kkthxbai
    var contextOptions = {
      "show profile": function($link, closeContextMenu) {
        var url = $link.prop("href");
        if (protonet.config.allow_modal_views) {
          protonet.open(url);
        } else {
          window.open(url, "profile" + new Date().getTime());
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
    
    var contextMenu = new protonet.ui.ContextMenu("a[data-user-id]", contextOptions, "context-menu-users");
  },
  
  getUser: function(userId) {
    var user = this.usersData[+userId];
    return user;
  }
};

//= require "browser.js"
//= require "config.js"
//= require "getting_started.js"