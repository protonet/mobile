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
  
  function getActive() {
    return protonet.storage.get("active_rendezvous") || {};
  }
  
  function setActive(active) {
    protonet.storage.set("active_rendezvous", active);
  }
  
  function makeActive(channelId) {
    var active = getActive();
    active[channelId] = true;
    setActive(active);
  }
  
  function makeInactive(channelId) {
    var active = getActive();
    delete active[channelId];
    setActive(active);
  }
  
  function isActive(channelId) {
    var active = getActive();
    return active[channelId];
  }
  
  protonet.timeline.Rendezvous = Class.create(protonet.timeline.Channel, {
    initialize: function($super, data) {
      this.partner = getPartner(data.rendezvous);
      $super(data);
    },
    
    show: function() {
      if (this.tab.is(":hidden")) {
        this.tab.show();
        makeActive(this.data.id);
      }
    },
    
    hide: function() {
      if (this.tab.is(":visible")) {
        this.tab.hide();
        makeInactive(this.data.id);
        if (this.isSelected) {
          protonet.trigger("channels.change_to_first");
        }
      }
    },
    
    renderTab: function($super, container) {
      $super(container);
      
      this.link.addClass("rendezvous");
      
      this.hideLink = $("<span>", {
        "class":  "hide-link",
        title:    "close",
        click:    this.hide.bind(this)
      }).appendTo(this.tab);
      
      try {
        var hasUnreadMeeps = this.data.meeps[this.data.meeps.length - 1].id > (this.data.last_read_meep || 0);
      } catch(e) {}
      
      if (!isActive(this.data.id) && !hasUnreadMeeps) {
        this.tab.hide();
      }
      
      protonet.data.User.get(this.partner, function(user) {
        this.link.text(user.name);
        
        if (user.isOnline) {
          this.link.addClass("online");
        }
      }.bind(this));
      
      return this;
    },
    
    _observe: function($super) {
      protonet
        .on("rendezvous.start", function(partner) {
          if (partner == this.partner) {
            protonet.trigger("channel.change", this.data.id);
          }
        }.bind(this))
        
        .on("channel.change", function(channelId) {
          if (channelId === this.data.id) {
            this.show();
          }
        }.bind(this))
        
        .on("meep.receive", function(meepData) {
          if (meepData.channel_id === this.data.id) {
            this.show();
          }
        }.bind(this))
        
        .on("user.came_online user.goes_offline users.update_status", function() {
          if (protonet.data.User.isOnline(this.partner)) {
            this.link.addClass("online");
          } else {
            this.link.removeClass("online").removeClass("typing");
          }
        }.bind(this))
        
        .on("user.typing", function(data) {
          if (data.user_id === this.partner && data.channel_id === this.data.id) {
            this.link.addClass("typing");
          }
        }.bind(this))
        
        .on("user.typing_end", function(data) {
          if (data.user_id === this.partner) {
            this.link.removeClass("typing");
          }
        }.bind(this));
      
      $super();
    },
    
    _replyNotifications: function(meepData) {
      if (meepData.user_id == viewer) {
        return;
      }
      
      var isWindowFocused             = protonet.utils.isWindowFocused(),
          isAllowedToDoNotifications  = protonet.data.User.getPreference("reply_notification");
      
      if (!isWindowFocused && isAllowedToDoNotifications) {
        new protonet.ui.Notification({
          image:    meepData.avatar,
          title:    protonet.t("RENDEZVOUS_NOTIFICATION_TITLE", { author: meepData.author }),
          text:     meepData.message.truncate(140),
          onclick:  function() {
            protonet.trigger("channel.change", this.data.id);
          }.bind(this)
        });
      }
    }
  });
})(protonet);