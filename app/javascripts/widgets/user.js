//= require "../ui/resizer.js"
//= require "../ui/notification.js"
//= require "../media/proxy.js"

protonet.widgets.User = Class.create({
  initialize: function() {
    this.container = $("#user-widget");
    this.list = this.container.find("ul");
    this.resizer = this.container.find(".resize");

    this.onlineUsersCount = this.container.find("output.count");
    this.usersData = {};
    this.channelSubscriptions = {};

    this.list.find("a").each(function(i, link) {
      var $link     = $(link),
          $listItem = $link.parent();
      this.usersData[+$link.data("user-id")] = {
        element:              $listItem,
        name:                 $.trim($link.text()),
        isViewer:             $listItem.hasClass("myself"),
        isStranger:           false,
        avatar:               $link.data("user-avatar"),
        channelSubscriptions: []
      };
    }.bind(this));

    protonet.trigger("users.data_available", this.usersData);

    new protonet.ui.Resizer(this.list, this.resizer, { storageKey: "user_widget_height" });

    this._observe();
  },
  
  _observe: function() {
    protonet
      .bind("user.added", function(e, data) {
        /**
         * Creating a user will trigger the user.added event
         * and the user.subscribed_channel afterwards
         */
        if (!protonet.config.show_only_online_users) {
          this.createUser(data.id, data, true);
        }
      }.bind(this))
      
      .bind("user.typing", function(e, data) {
        this._typingStart(data.user_id, data.channel_uuid);
      }.bind(this))
      
      .bind("user.typing_end", function(e, data) {
        this._typingEnd(data.user_id);
      }.bind(this))
      
      .bind("user.subscribed_channel", function(e, data) {
        this._userSubscribedChannel(data.user_id, data.channel_uuid);
      }.bind(this))
      
      .bind("user.unsubscribed_channel", function(e, data) {
        this._userUnsubscribedChannel(data.user_id, data.channel_uuid);
      }.bind(this))

      .bind("user.came_online", function(e, data) {
        this.userCameOnline(data);
        this.filterChannelUsers();
      }.bind(this))

      .bind("user.goes_offline", function(e, data) {
        this.userWentOffline(data);
        this.filterChannelUsers();
      }.bind(this))
      
      .bind("users.update_status", function(e, data) {
        this.updateUsers(data.online_users);
        this.filterChannelUsers();
      }.bind(this))
      
      .bind("user.changed_avatar", function(e, data) {
        var user = this.usersData[data.id];
        if (user) {
          user.avatar = data.avatar;
        }
      }.bind(this))
      
      /**
       * Update subscriptions for all subscribed channels
       */
      .bind("channels.update_subscriptions", function(e, channelSubscriptions) {
        $.extend(this.channelSubscriptions, channelSubscriptions.data);
        this.filterChannelUsers();
      }.bind(this))
      
      .bind("socket.disconnected", function() {
        protonet.trigger("users.update_status", { online_users: {} });
      }.bind(this))
      
      .bind("channel.change", function(e, channelId) {
        this.filterChannelUsers(+channelId);
      }.bind(this));
    
    /**
     * Show user image onmouseover
     */
    this.container
      .delegate("li > a[data-user-id]", "mouseover", function(event) {
        var $link  = $(event.target),
            image  = $link.find("img"),
            user,
            imageSize;
        if (!image.length) {
          user      = this.usersData[+$link.data("user-id")];
          imageSize = { width: 20, height: 20 };
          if (user) {
            $("<img>", $.extend({
              src: protonet.media.Proxy.getImageUrl(user.avatar || protonet.config.default_avatar, imageSize)
            }, imageSize)).appendTo($link);
          }
        }
      }.bind(this));
  },
  
  /**
   * Gets something like this:
   *   {
   *       "200": {
   *           "name": "tiff",
   *           "connections": [[408344, "web"], [147121, "web"]]
   *       },
   *       "306": {
   *           "name": "stranger_number_66f9a8b65c",
   *           "connections": [[691946, "web"]]
   *       }
   *   },
   *
   * Note: strangers will only be shown when they are online
   *
   * TODO: add logic for when user is per via api connected, we need an icon here for, btw.
   */
  updateUsers: function(onlineUsers) {
    // Create users if they don't exist already
    this.createUsers(onlineUsers);
    
    for (var userId in this.usersData) {
      this.updateUser(userId, onlineUsers);
    }
    
    this.sortEntries();
    this.cleanupStrangers();
    this.updateCount();
    
    protonet.trigger("users.data_available", this.usersData);
  },
  
  updateUser: function(userId, onlineUsers) {
    var user = this.usersData[userId],
        onlineUser = onlineUsers[userId];
    
    if (!user) {
      return;
    }
    
    var hasBeenOnlineBefore = user.isOnline !== false;
    user.isOnline = !!onlineUser;
    
    // Highlight effect for users that just came online
    if (user.isOnline && !hasBeenOnlineBefore) {
      user.element
        .addClass("new-online")
        .css("backgroundColor", "#ffff99")
        .animate({ "backgroundColor": "#ffffff" }, { duration: 1000 });
    }
    
    if (user.isOnline) {
      user.element.addClass("online");
    } else {
      user.element.removeClass("online").removeClass("typing");
      if (protonet.config.show_only_online_users) {
        delete this.usersData[userId];
        user.element.remove();
      }
    }
  },
  
  /**
   * Expects something like 
   *  { 101: { name: "tiff" }, 202: { name: "ali" } }
   * as users parameters
   */
  createUsers: function(users) {
    for (var userId in users) {
      this.createUser(userId, users[userId]);
    }
  },
  
  createUser: function(userId, user, hide) {
    if (this.usersData[userId] || !user.id) {
      return;
    }
    
    var isViewer = protonet.config.user_name === user.name,
        isStranger = user.name.startsWith("stranger_"),
        $element = this.createElement(user, isViewer, isStranger);
    
    hide && element.hide();
    
    this.usersData[userId] = {
      name:                   user.name,
      isViewer:               isViewer,
      isStranger:             isStranger,
      avatar:                 user.avatar,
      channelSubscriptions:   [],
      element:                $element
    };
  },
  
  createElement: function(user, isViewer, isStranger) {
    return $("<li>",{
      "class": [isViewer ? "myself" : "", isStranger ? "stranger" : ""].join(" ")
    }).append(
      $("<a>", {
        href:            "/users/" + user.id,
        title:           user.name,
        "data-user-id":  user.id,
        tabindex:        -1,
        text:            user.name
      })
    ).appendTo(this.list);
  },
  
  sortEntries: function() {
    this.list.find(".online").prependTo(this.list);
    this.list.find(".new-online").removeClass("new-online").prependTo(this.list);
    this.list.find(".typing").prependTo(this.list);
  },
  
  cleanupStrangers: function() {
    for (var i in this.usersData) {
      var user = this.usersData[i];
      if (user.isStranger && !user.isOnline) {
        user.element.remove();
        delete this.usersData[i];
      }
    }
  },
  
  filterChannelUsers: function(channelId) {
    channelId = channelId || protonet.timeline.Channels.selected;
    if(!channelId || !protonet.timeline.Channels.channelIdToUuid) {
      return;
    }
    // transform input (id or uuid) to uuid
    if(channelId && channelId.toString().match("-")) {
      channelUuid = channelId;
    } else {
      channelUuid = protonet.timeline.Channels.channelIdToUuid[channelId];
    }
    
    var channelSubscriptions = this.channelSubscriptions[channelUuid];
    if (!this.channelSubscriptions[channelUuid]) {
      return;
    }
    
    this.list.children().hide();
    
    for (var i=0, l=channelSubscriptions.length; i<l; i++) {
      var userId = channelSubscriptions[i],
          user = this.usersData[userId];
      if (user) {
        user.element.show();
      }
    }
    
    this.updateCount();
  },
  
  updateCount: function() {
    var total = 0, online = 0;
    for (var i in this.usersData) {
      var user = this.usersData[i];
      if (user.element.is(":visible")) {
        total++;
        if (this.usersData[i].isOnline) {
          online++;
        }
      }
    }
    
    this.onlineUsersCount.text("(" + online + "/" + total + ")");
  },
  
  userCameOnline: function(userData) {
    this.createUser(userData.id, userData);
    var onlineUsers = {};
    onlineUsers[userData.id] = true;
    this.updateUser(userData.id, onlineUsers);
    
    // handle channel subscriptions
    for (var i in userData.subscribed_channel_ids) {
      var channelId = userData.subscribed_channel_ids[i];
      if (this.channelSubscriptions[channelId]) {
        this.channelSubscriptions[channelId].push(userData.id);
      }
    }
    
    // duplicated from updateUsers
    this.sortEntries();
    this.cleanupStrangers();
    this.updateCount();
    
    protonet.trigger("users.data_available", this.usersData);
  },
  
  userWentOffline: function(userData) {
    var onlineUsers = {};
    this.updateUser(userData.id, onlineUsers);
    
    // duplicated from updateUsers
    this.sortEntries();
    this.cleanupStrangers();
    this.updateCount();
    
    protonet.trigger("users.data_available", this.usersData);
  },
  
  _userUnsubscribedChannel: function(userId, channelId) {
    var channelUsers = this.channelSubscriptions[channelId];
    if (channelUsers) {
      channelUsers.splice(channelUsers.indexOf(userId), 1);
    }
    if (channelId == protonet.timeline.Channels.selected) {
      var user = this.usersData[userId];
      user && user.element.hide();
      this.updateCount();
    }
  },
  
  _userSubscribedChannel: function(userId, channelId) {
    this.channelSubscriptions[channelId] = this.channelSubscriptions[channelId] || [];
    this.channelSubscriptions[channelId].push(userId);
    if (channelId == protonet.timeline.Channels.selected) {
      var user = this.usersData[userId];
      user && user.element.show();
      this.updateCount();
    }
  },
  
  _typingStart: function(userId, channelUuid) {
    if (channelUuid == protonet.timeline.Channels.selectedUuid) {
      var user = this.usersData[userId] || {};
      if (user.element) {
        user.element.prependTo(this.list).addClass("typing");
      }
    }
  },
  
  _typingEnd: function(userId) {
    var user = this.usersData[userId] || {};
    if (user.element) {
      user.element.removeClass("typing");
    }
  }
});
