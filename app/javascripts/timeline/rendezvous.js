//= require "../utils/is_window_focused.js"

/**
 * A rendezvous is a chat between two people
 * Has the same characteristics as a channel just with a few adjustments
 */
(function() {
  var viewer = protonet.config.user_id;
  
  /**
   * Expects a rendezvous channel key
   * which has the following format: <user id>:<user id>
   * It parses the string and returns the id that is not the user id of the current user (viewer)
   */
  function getPartner(rendezvousStr) {
    var rendezvousArr = rendezvousStr.split(":");
    return +(rendezvousArr[0] == viewer ? rendezvousArr[1] : rendezvousArr[0]);
  }
  
  protonet.timeline.Rendezvous = Class.create(protonet.timeline.Channel, {
    initialize: function($super, data) {
      this.partner = getPartner(data.rendezvous);
      $super(data);
    },
    
    renderTab: function($super, container) {
      $super(container);
      
      var user = protonet.user.getUser(this.partner) || { name: "stranger", isOnline: false };
      this.link.addClass("rendezvous").text(user.name);
      
      if (user.isOnline) {
        this.link.addClass("online");
      }
      
      this.hideLink = $("<span>", {
        "class": "hide-link",
        title: "close",
        click: function() {
          this.tab.hide();
          protonet.trigger("channels.change_to_first");
        }.bind(this)
      }).appendTo(this.tab);
      
      this.tab.hide();
      
      return this;
    },
    
    _observe: function($super) {
      protonet
        .bind("rendezvous.start", function(e, partner) {
          if (partner === this.partner) {
            protonet.trigger("channel.change", this.data.id);
          }
        }.bind(this))
        
        .bind("channel.change", function(e, channelId) {
          if (channelId === this.data.id) {
            this.tab.show();
          }
        }.bind(this))
        
        .bind("meep.receive", function(e, meepData) {
          if (meepData.channel_id === this.data.id) {
            this.tab.show();
          }
        }.bind(this))
        
        .bind("user.came_online", function(e, userData) {
          if (userData.id === this.partner) {
            this.link.addClass("online");
          }
        }.bind(this))
        
        .bind("user.goes_offline", function(e, userData) {
          if (userData.id === this.partner) {
            this.link.removeClass("online").removeClass("typing");
          }
        }.bind(this))
        
        .bind("user.typing", function(e, data) {
          if (data.user_id === this.partner && data.channel_id === this.data.id) {
            this.link.addClass("typing");
          }
        }.bind(this))
        
        .bind("user.typing_end", function(e, data) {
          if (data.user_id === this.partner) {
            this.link.removeClass("typing");
          }
        }.bind(this))
        
        .bind("users.update_status", function(e, data) {
          var onlineUsers = data.online_users;
          if (onlineUsers[this.partner]) {
            this.link.addClass("online");
          } else {
            this.link.removeClass("online").removeClass("typing");
          }
        }.bind(this));
      
      $super();
    },
    
    _replyNotifications: function(meepData) {
      if (meepData.user_id == viewer) {
        return;
      }
      
      var isWindowFocused             = protonet.utils.isWindowFocused(),
          isAllowedToDoNotifications  = protonet.user.Config.get("reply_notification");
      
      if (!isWindowFocused && isAllowedToDoNotifications) {
        new protonet.ui.Notification({
          image:  meepData.avatar,
          title:  protonet.t("RENDEZVOUS_NOTIFICATION_TITLE", { author: meepData.author }),
          text:   meepData.message.truncate(140)
        });
      }
    }
  });
})(protonet);