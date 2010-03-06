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
    
    this.entries.each(function(i, entry){
      var user_id = entry.id.match(REG_EXP_ID)[1];
      this.user_objects[user_id] = $(entry);
      this.user_names.push(this.user_objects[user_id].children("span").html());
    }.bind(this));
  };
  
  UserWidget.prototype = {
    // note to self: a more performant version would be:
    // send an integer identifier (update 102923)
    // if I received (update - 1) just do an incremental udpate
    // this would ensure data integrity and be very fast ;)
    "update": function(data) {
      var online_users = data.online_users;
      for(var i in this.user_objects) {
        var online_user = online_users[i];
        var current_dom_object = this.user_objects[i];
        var css_class = this.cssClassForConnections(online_user && online_user.connections);
        if (!current_dom_object.hasClass(css_class)) {
          current_dom_object.attr("class", css_class);
        }
      }
      
      this.sortEntries();
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
      this.entries.each(function(i, entry) {
        entry = $(entry);
        if (entry.hasClass("online")) {
          this.user_list.prepend(entry);
        }
      }.bind(this));
    },
    
    "updateWritingStatus": function(data) {
      var user_id = data.data.user_id;
      var status  = data.data.status;
      var current_dom_object = this.user_objects[user_id];
      if (current_dom_object && status == "writing") {
        if (!current_dom_object.hasClass("writing")) {
          this.user_list.prepend(current_dom_object);
          current_dom_object.attr("class", "writing");
        }
      } else {
        if (!current_dom_object.hasClass("online")) {
          current_dom_object.attr("class", "online");
        }
      }
    }
   };
  
  return UserWidget;
  
})();