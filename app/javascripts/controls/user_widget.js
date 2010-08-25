protonet.controls.UserWidget = (function() {
  var REG_EXP_ID = /user-list-user-(.*)/,
      CONNECTION_CLASSES = {
        "web": "online"
      };
  
  function UserWidget(args) {
    this.container = $("#user-list");
    this.updateEntries();
    this.user_list = this.container.find("ul.root");
    this.user_names = [];
    this.user_objects = {};
    this.channel_users = {};
    this.temporaryUsers = {};
    
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
      this.filterChannelUsers(protonet.globals.channelSelector.getCurrentChannelId());
    }.bind(this));
    
    protonet.Notifications.bind('channel.subscribe channel.unsubscribe', function(e, msg){
      switch(e.handleObj.namespace) {
        case 'subscribe':
          this.channel_users[msg.channel_id].push(msg.user_id);
          break;
        case 'unsubscribe':
          this.channel_users[msg.channel_id].splice(this.channel_users[msg.channel_id].indexOf(msg.user_id), 1);
          break;
      }
      this.filterChannelUsers(protonet.globals.channelSelector.getCurrentChannelId());
    }.bind(this));
    
    protonet.Notifications.bind('channel.update_subscriptions', function(e, msg){
      for(var i in msg.data) {
        this.channel_users[i] = msg.data[i];
      };
      this.filterChannelUsers(protonet.globals.channelSelector.getCurrentChannelId());
    }.bind(this));
        
    protonet.Notifications.bind("channel.changed", function(e, id) {
      this.filterChannelUsers(id);
    }.bind(this));
    
    protonet.Notifications.bind("user.update_online_states", function(e, msg){
      this.update(msg);
    }.bind(this));
  };
  
  UserWidget.prototype = {
    "addUserFromMessage": function(msg) {
      this.addUser(msg.user_id, this.addUserElement(msg.user_id, msg.avatar_url, msg.user_name));
      this.entries = this.container.find("li"); // recalculate
    },
    
    "addUserElement": function(userId, avatarUrl, userName) {
      var newUserEntry = this.entries.first().clone();
      newUserEntry.attr("id", 'user-list-user-' + userId);
      newUserEntry.find('img').attr('src', avatarUrl);
      newUserEntry.find('span').html(userName);
      this.user_list.append(newUserEntry);
      return newUserEntry;
    },
    
    "addUser": function(user_id, element) {
      this.user_objects[user_id] = $(element);
      this.user_names.push(this.user_objects[user_id].children("span").html());      
      this.updateEntries();
    },
    
    "removeUser": function(user_id) {
      var userName = this.user_objects[user_id].children("span").html();
      delete this.temporaryUsers[user_id];
      this.user_objects[user_id].remove();
      delete this.user_objects[user_id];
      this.user_names.splice (jQuery.inArray(userName, this.user_names),1);
      this.updateEntries();
    },
    
    "updateEntries": function() {
      this.entries = this.container.find("li");
    },
    
    // note to self: a more performant version would be:
    // send an integer identifier (update 102923)
    // if I received (update - 1) just do an incremental udpate
    // this would ensure data integrity and be very fast ;)
    "update": function(data) {
      var online_users = data.online_users;
      var online_user;
      for(var i in online_users) {
        online_user            = online_users[i];
        var connection_class   = this.cssClassForConnections(online_user && online_user.connections);
        var current_dom_object = this.user_objects[i];
        if(!current_dom_object) {
          current_dom_object = this.addUserElement(i, "/images/userpicture.jpg", online_user["name"]);
          this.addUser(i, current_dom_object);
          this.temporaryUsers[i] = current_dom_object;
        }
        current_dom_object.attr("class", connection_class);
      }

      for(i in this.temporaryUsers) {
        online_user = online_users[i];
        if(!online_user && online_user != 0) {
          this.removeUser(i);
        }
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