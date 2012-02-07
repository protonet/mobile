//= require "../resizer.js"
//= require "../../media/proxy.js"

protonet.ui.User.Widget = {
  initialize: function() {
    this.$widget = $("#user-widget");
    if (!this.$widget.length) {
      return;
    }
    
    this.elements          = {};
    this.$list             = this.$widget.find("ul");
    this.$resizer          = this.$widget.find(".resize");
    this.$onlineUsersCount = this.$widget.find("output.count");
    this.$title            = this.$widget.find("output.title");
    
    new protonet.ui.Resizer(this.$list, this.$resizer, { storageKey: "user_widget_height" });
    
    this._observe();
    this.update();
  },
  
  _observe: function() {
    protonet
      
      .on("users.update_status socket.disconnected", this.update.bind(this, true))
      
      .on("users.update_admin_status", this.updateAdminStatus.bind(this))
      
      .on("user.subscribed_channel user.unsubscribed_channel channels.update_subscriptions channel.change", this.filter.bind(this))
      
      .on("user.added", function(data) {
        if (!protonet.config.show_only_online_users) {
          this.createUser(data.id, true);
        }
      }.bind(this))
      
      .after("users.update_status", function() {
        this.highlightingEnabled = true;
      }.bind(this))
      
      .on("user.typing", function(data) {
        this._typingStart(data.user_id, protonet.data.Channel.getIdByUuid(data.channel_uuid));
      }.bind(this))
      
      .on("user.typing_end", function(data) {
        this._typingEnd(data.user_id);
      }.bind(this))
      
      .on("user.came_online user.goes_offline", function(data) {
        this.updateUser(data.id);
      }.bind(this));
      
    
    /**
     * Show user image onmouseover
     */
    this.$list.delegate("[data-user-id]", "mouseover", function(event) {
      var $link     = $(this),
          $image    = $link.find("img"),
          imageSize = { width: 20, height: 20 },
          avatar    = protonet.data.User.getAvatar($link.data("user-id"));
      
      if (!$image.length && avatar) {
        $("<img>", $.extend({
          src:   protonet.media.Proxy.getImageUrl(avatar, imageSize),
          error: function() {
            $(this).attr("src", protonet.config.default_avatar).unbind("error");
          }
        }, imageSize)).appendTo($link);
      }
    });
  },
  
  updateAdminStatus: function() {
    this.$list.find(".admin-flag").remove();
    
    var admins = protonet.data.User.getAdmins();
    $.each(admins, function(i, id) {
      this.get$Element(id).find("a").append(" " + new protonet.utils.Template("admin-flag-template"));
    }.bind(this));
  },
  
  createUser: function(id, hide) {
    if (this.elements[id]) {
      return;
    }
    
    this.create$Element(id, hide);
  },
  
  create$Element: function(userId, hide) {
    protonet.data.User.get(userId, function(user) {
      var adminFlag = user.isAdmin ? (" " + new protonet.utils.Template("admin-flag-template")) : "";

      var $element = $("<li>",{
        "class": [user.isViewer ? "myself" : "", user.isStranger ? "stranger" : ""].join(" ")
      }).append(
        $("<a>", {
          href:            protonet.data.User.getUrl(user.id),
          title:           user.name,
          "data-user-id":  user.id,
          tabindex:        -1,
          html:            user.name + adminFlag
        })
      );

      if (hide) {
        $element.hide();
      }

      this.elements[userId] = $element.appendTo(this.$list);
    }.bind(this));
  },
  
  getAll$Elements: function() {
    return this.$list.children();
  },
  
  get$Element: function(userId) {
    return this.elements[userId] || $();
  },
  
  count: function() {
    var total   = this.$list.find("li:visible").length,
        online  = this.$list.find("li.online:visible").length;
    
    this.$onlineUsersCount.text("(" + online + "/" + total + ")");
  },
  
  filter: function(channelId) {
    channelId                 = Number(channelId) || protonet.timeline.Channels.selected;
    
    var channelSubscriptions  = protonet.data.Channel.getSubscriptions(channelId),
        isGlobalChannel       = protonet.data.Channel.isGlobal(channelId);
    
    if (isGlobalChannel) {
      this.$title.html(protonet.t("USERS_IN_REMOTE_CHANNEL"));
    } else {
      this.$title.html(protonet.t("USERS_IN_NORMAL_CHANNEL"));
    }
    
    if (!channelSubscriptions) {
      return;
    }
    
    this.getAll$Elements().hide();
    $.each(channelSubscriptions, function(i, userId) {
      var $element = this.get$Element(userId);
      if (isGlobalChannel) {
        if (protonet.data.User.isOnline(userId)) {
          $element.show();
        }
      } else {
        $element.show();
      }
    }.bind(this));
    
    this.count();
  },
  
  sort: function() {
    this.$list.find(".online").prependTo(this.$list);
    this.$list.find(".new-online").removeClass("new-online").prependTo(this.$list);
    this.$list.find(".typing").prependTo(this.$list);
  },
  
  cleanup: function() {
    this.$list.find(".stranger:not(.online)").remove();
  },
  
  update: function(cleanUp) {
    var users = protonet.data.User.getCache();
    $.each(users, function(i, user) {
      this._updateUser(user.id);
    }.bind(this));
    
    if (cleanUp === true) {
      this.cleanup();
    }
    
    this.sort();
    this.filter();
  },
  
  updateUser: function(userId) {
    this._updateUser(userId);
    
    this.cleanup();
    this.sort();
    this.filter();
  },
  
  _updateUser: function(userId) {
    this.createUser(userId);
    
    var $element            = this.get$Element(userId),
        isOnline            = protonet.data.User.isOnline(userId),
        hasBeenOnlineBefore = $element.hasClass("online");
    
    // Highlight effect for users that just came online
    if (isOnline && !hasBeenOnlineBefore && this.highlightingEnabled) {
      $element
        .addClass("new-online")
        .css("backgroundColor", "#ffff99")
        .animate({ "backgroundColor": "#ffffff" }, { duration: 1000 });
    }
    
    if (isOnline) {
      $element.addClass("online");
    } else {
      $element.removeClass("online").removeClass("typing");
      if (protonet.config.show_only_online_users) {
        $element.remove();
      }
    }
  },
  
  _typingStart: function(userId, channelId) {
    if (channelId == protonet.timeline.Channels.selected) {
      this.get$Element(userId).prependTo(this.$list).addClass("typing");
    }
  },
  
  _typingEnd: function(userId) {
    this.get$Element(userId).removeClass("typing");
  }
};