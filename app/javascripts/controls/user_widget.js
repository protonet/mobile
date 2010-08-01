protonet.controls.UserWidget = (function() {
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
    
    protonet.Notifications.bind('channel.subscribe channel.unsubscribe', function(e, msg){
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