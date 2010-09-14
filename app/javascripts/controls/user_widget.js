//= require "../ui/resizer.js"
//= require "../ui/notification.js"
//= require "../lib/jquery-ui-1.8.4.highlight-effect.min.js"

protonet.controls.UserWidget = function() {
  this.container = $("#user-widget");
  this.list = this.container.find("ul");
  this.resizer = this.container.find(".resize");
  
  this.onlineUsersCount = this.container.find("output.count");
  this.usersData = {};
  
  this.list.find("li").each(function(i, li) {
    li = $(li);
    this.usersData[+li.attr("data-user-id")] = {
      element:    li,
      name:       li.text(),
      isViewer:   li.hasClass("myself"),
      isStranger: false
    };
  }.bind(this));
  
  protonet.Notifications.trigger("users.data_available", this.usersData);
  
  new protonet.ui.Resizer(this.list, this.resizer);
  
  this._observe();
};

protonet.controls.UserWidget.prototype = {
  _observe: function() {
    protonet.Notifications
      .bind("user.added", function(e, data) {
        this.createUser(data.id, data);
      }.bind(this))
      
      .bind("user.typing", function(e, data) {
        this._typingStart(data.user_id);
      }.bind(this))
      
      .bind("user.typing_end", function(e, data) {
        this._typingEnd(data.user_id);
      }.bind(this))
      
      .bind("user.subscribed_channel", function(e, data) {
        
      })
      
      .bind("user.unsubscribed_channel", function(e, data) {
        
      })
      
      .bind("users.update_status", function(e, data) {
        this.updateUsers(data.online_users);
      }.bind(this))
      
      .bind("channels.update_subscriptions", function(e, data) {
        
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
   * TODO: they are not visible in the user widget when initially rendered
   *  which means that we have to insert them into the dom tree by ourselves
   *  eg. by firing "user.added"
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
    this.updateCount();
    this.cleanupStrangers();
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
  
  createUser: function(userId, user) {
    if (this.usersData[userId]) {
      return;
    }
    
    var isViewer = protonet.user.data.name == user.name,
        isStranger = user.name.startsWith("stranger_");
    
    this.usersData[userId] = {
      name:       user.name,
      isViewer:   isViewer,
      isStranger: isStranger,
      element:    this.createElement(userId, user.name, isViewer, isStranger)
    };
  },
  
  createElement: function(userId, userName, isViewer, isStranger) {
    return $("<li />", {
      "data-user-id": userId,
      text:           userName,
      title:          userName,
      tabIndex:       -1,
      className:      [isViewer ? "myself" : "", isStranger ? "stranger" : ""].join(" ")
    }).appendTo(this.list);
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
        user.element.detach();
        delete this.usersData[i];
      }
    }
  },
  
  updateCount: function() {
    var total = 0, online = 0;
    for (var i in this.usersData) {
      total++;
      if (this.usersData[i].isOnline) {
        online++;
      }
    }
    
    this.onlineUsersCount.text("(" + online + "/" + total + ")");
  },
  
  _typingStart: function(userId) {
    var userData = this.usersData[userId];
    if (userData.element) {
      userData.element.prependTo(this.list).addClass("typing");
    }
  },
  
  _typingEnd: function(userId) {
    var userData = this.usersData[userId];
    if (userData.element) {
      userData.element.removeClass("typing");
    }
  }
};


protonet.controls.UserWidgetOld = (function() {
  var REG_EXP_ID = /user-list-user-(.*)/,
      CONNECTION_CLASSES = {
        "web": "online"
      };
  
  function UserWidget(args) {
    this.container = $("#user-list");
    this.entries = this.container.find("li");
    this.user_list = this.container.find("ul.root");
    this.user_names = [];
    this.user_objects = {};
    this.channel_users = {};
    
    this.entries.each(function(i, entry){
      var user_id = entry.id.match(REG_EXP_ID)[1];
      this.addUser(user_id, entry);
    }.bind(this));
    
    if (protonet.globals.inputConsole) {
      protonet.globals.inputConsole.initAutocompleter(this.user_names, {'prepend': true});
      protonet.globals.inputConsole.bindAutocompleterToUserAddedEvents();
    }
    
    protonet.Notifications.bind('user.added', function(e, msg){
      this.addUserFromMessage(msg);
      this.filterChannelUsers(protonet.timeline.Channels.selected);
    }.bind(this));
    
    protonet.Notifications.bind('channel.subscribed channel.unsubscribed', function(e, msg){
      switch(e.handleObj.namespace) {
        case 'subscribe':
          this.channel_users[msg.channel_id].push(msg.user_id);
          break;
        case 'unsubscribe':
          this.channel_users[msg.channel_id].splice(this.channel_users[msg.channel_id].indexOf(msg.user_id), 1);
          break;
      }
      this.filterChannelUsers(protonet.timeline.Channels.selected);
    }.bind(this));
    
    protonet.Notifications.bind('channel.update_subscriptions', function(e, msg){
      for(var i in msg.data) {
        this.channel_users[i] = msg.data[i];
      };
      this.filterChannelUsers(protonet.timeline.Channels.selected);
    }.bind(this));
        
    protonet.Notifications.bind("channel.change", function(e, id) {
      this.filterChannelUsers(id);
    }.bind(this));
  };
  
  UserWidget.prototype = {
    "addUserFromMessage": function(msg) {
      var newUserEntry = this.entries.first().clone();
      newUserEntry.attr("id", 'user-list-user-' + msg.user_id);
      newUserEntry.find('img').attr('src', msg.avatar_url);
      newUserEntry.find('span').html(msg.user_name);
      this.user_list.append(newUserEntry);
      this.addUser(msg.user_id, newUserEntry[0]);
      this.entries = this.container.find("li"); // recalculate
    },
    
    "addUser": function(user_id, element) {
      this.user_objects[user_id] = $(element);
      this.user_names.push(this.user_objects[user_id].children("span").html());      
    },
    
    // note to self: a more performant version would be:
    // send an integer identifier (update 102923)
    // if I received (update - 1) just do an incremental udpate
    // this would ensure data integrity and be very fast ;)
    "update": function(data) {
      var online_users = data.online_users;
      for(var i in this.user_objects) {
        var online_user = online_users[i];
        var current_dom_object = this.user_objects[i];
        var connection_class = this.cssClassForConnections(online_user && online_user.connections);
        // var channel_classes  = this.cssClassForChannels(online_user && online_user.channels);
        current_dom_object.attr("class", connection_class);
      }
      
      this.sortEntries();
    },
    
    "filterChannelUsers": function(channel_id) {
      if(protonet.user.Config.get("always_show_all_users_in_channels")) {
        for(user_id in this.user_objects) {
          this.user_objects[user_id].show();
        }
      } else {
        for(user_id in this.user_objects) {
          if($.inArray(parseInt(user_id, 10), this.channel_users[channel_id]) >= 0) {
            this.user_objects[user_id].show();
          } else {
            this.user_objects[user_id].hide();
          };
        };
      }
    },

    "cssClassForConnections": function(sockets) {
      if (!sockets) {
        return "offline";
      }
      
      for (var x in sockets) {
        var socket = sockets[x][1];
        var type = CONNECTION_CLASSES[socket] || socket;
        // web trumps socket, break if the user has a web connection
        if (type == "web") { break; }
      };
      return type;
    },
    
    "sortEntries": function() {
      this.entries.filter(".api").prependTo(this.user_list);
      this.entries.filter(".online").prependTo(this.user_list);
      this.entries.filter(".writing").prependTo(this.user_list);
    },
    
    "updateWritingStatus": function(data) {
      var user_id = data.data.user_id;
      var status  = data.data.status;
      var current_dom_object = this.user_objects[user_id];
      if (current_dom_object && status == "writing") {
        this.user_list.prepend(current_dom_object);
        current_dom_object.attr("class", "writing");
      } else {
        current_dom_object.attr("class", "online");
      }
    },
    
    "getUserNames": function() {
      return this.user_names;
    }
  };
  
  return UserWidget;
  
})();