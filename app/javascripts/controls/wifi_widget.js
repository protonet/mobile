//= require "../ui/resizer.js"
//= require "../ui/notification.js"

protonet.controls.WifiWidget = function() {
  this.container = $("#wifi-user-widget");
  this.list = this.container.find("ul");
  this.resizer = this.container.find(".resize");
  
  this.onlineWifiUsersCount = this.container.find("output.wifi-count");
  this.usersData = {};
  this.channelSubscriptions = {};
  
  this.list.children().each(function(i, li) {
    li = $(li);
    this.usersData[+li.attr("data-wifi-id")] = {
      element:              li,
      name:                 $.trim(li.text()),
      isViewer:             li.hasClass("myself"),
      isStranger:           false,
    };
  }.bind(this));
  
  protonet.Notifications.trigger("users.data_available", this.usersData);
  
  new protonet.ui.Resizer(this.list, this.resizer, { storageKey: "user_widget_height" });
  
  this._observe();
};

protonet.controls.WifiWidget.prototype = {
  _observe: function() {
	
	protonet.Notifications.bind('*', function(e, data) { 
		alert("e:" + e + "\n" + "data:" + data) }
	);
	
	
    protonet.Notifications
      .bind("wifi.added", function(e, data) {
        /**
         * Creating a user will trigger the user.added event
         * and the user.subscribed_channel afterwards
         */
        this.createUser(data.id, data, true);
      }.bind(this))
      
      .bind("users.update_status", function(e, data) {
        this.updateUsers(data.online_users);
        this.filterChannelUsers();
      }.bind(this))
      
      .bind("socket.disconnected", function() {
        this.updateUsers({});
      }.bind(this))
      
      .bind("channel.change", function(e, channelId) {
        this.filterChannelUsers(channelId);
      }.bind(this));
    
    this.container.delegate("li[data-user-id] > a", "dragstart", function(event) {
      if (event.originalEvent.dataTransfer)  {
        event.originalEvent.dataTransfer.setData("text/plain", "@" + $(this).text() + " ");
      }
    });
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
      var user = this.usersData[userId],
          onlineUser = onlineUsers[userId];
      
      var hasBeenOnlineBefore = user.isOnline !== false;
      user.isOnline = !!onlineUser;
      
      // Highlight effect for users that just came online
      if (user.isOnline && !hasBeenOnlineBefore) {
        user.element
          .addClass("new-online")
          .css("backgroundColor", "#ffff99")
          .animate({ "backgroundColor": "#ffffff" }, { duration: 1000 });
      }
      
      user.isOnline ? user.element.addClass("online") : user.element.removeClass("online").removeClass("typing");
    }
    
    this.sortEntries();
    this.cleanupStrangers();
    this.updateCount();
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
	
	alert('id:' + userId  + '\n' + 'user:' + user  + '\n' + 'hide:' + hide  + '\n\n')
	
    if (this.usersData[userId]) {
      return;
    }
    
    var isViewer = protonet.user.data.name == user.name,
        isStranger = user.name.startsWith("stranger_"),
        element = this.createElement(userId, user.name, isViewer, isStranger);
    
    hide && element.hide();
    
    this.usersData[userId] = {
      name:                 user.name,
      isViewer:             isViewer,
      isStranger:           isStranger,
      channelSubscriptions: [],
      element:              element
    };
  },
  
  createElement: function(userId, userName, isViewer, isStranger) {
    return $("<li />", {
      "data-user-id": userId,
      title:          userName,
      className:      [isViewer ? "myself" : "", isStranger ? "stranger" : ""].join(" ")
    }).append(
      $("<a />", {
        tabIndex: -1,
        href:     "#",
        text:     userName
      })
    ).appendTo(this.list);
  },
  
  sortEntries: function() {
    this.list.find(".api").prependTo(this.list);
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
    var channelSubscriptions = this.channelSubscriptions[channelId];
    if (!this.channelSubscriptions[channelId]) {
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
    
    this.onlineWifiUsersCount.text("(" + granted + "/" + connected + ")");
  }
};