//= require "../media/try_to_load_image.js"

protonet.ui.User = {
  initialize: function() {
    this.Widget.initialize();
    this.GettingStarted.initialize();
    this.Preferences.initialize();
    
    this._observe();
    this._createContextMenu();
  },
  
  _observe: function() {
    protonet
      .on("meep.rendered", function(element, data, instance) {
        if (data.author == protonet.config.user_name && data.user_id == protonet.config.user_id && !instance.merged) {
          element.addClass("own");
        }
      })
      
      .on("user.changed_avatar", function(user) {
        var selector = [
          "a[data-user-id='" + user.id + "'] > img",
          "img[data-user-avatar='" + user.id + "']"
        ];
        
        if (user.id == protonet.config.user_id) {
          selector.push("img[data-my-avatar]");
        }
        
        selector = selector.join(",");
        $(selector).toArray().chunk(function(img) {
          var $img       = $(img),
              dimensions = { width:  $img.width(), height: $img.height() },
              avatar     = protonet.media.Proxy.getImageUrl(user.avatar, dimensions);
          protonet.media.tryToLoadImage(avatar, function() {
            $img.attr("data-src") ? $img.attr("data-src", avatar) : $img.attr("src", avatar);
          });
        });
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
        var user = this.usersData[link.data("user-id")] || (function() {
          var meep = link.parents("li").data("meep");
          return meep && { name: meep.author };
        })();
        if (user) {
          protonet.trigger("form.create_reply", user.name);
        }
        closeContextMenu();
      }.bind(this),
      "start private chat": function(link, closeContextMenu) {
        protonet
          .trigger("rendezvous.start", +link.data("user-id"))
          .trigger("modal_window.hide");
        closeContextMenu();
      }.bind(this)
    };
    
    var contextMenu = new protonet.ui.ContextMenu("a[data-user-id]", contextOptions, "context-menu-users");
    contextMenu.bind("opening", function(e, menu, target) {
      var userId = target.data("user-id");
      if (userId.toString().match(/_/) || userId == -1) {
        $.each(["show profile", "start private chat"], function(i, element){
          menu.list.children("li:contains('" + element + "')").hide();
        });
      } else {
        $.each(["show profile", "start private chat"], function(i, element){
          menu.list.children("li:contains('" + element + "')").show();
        });
      }
    });
  }
};

//= require "user/widget.js"
//= require "user/getting_started.js"
//= require "user/preferences.js"