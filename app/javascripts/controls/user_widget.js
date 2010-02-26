protonet.controls.UserWidget = (function() {

  function UserWidget(args) {
    this.user_list = $("#user-list li");
    this.user_names = [];
    this.user_objects = {};
    this.user_list.each(function(i){
      var user_id = this.user_list[i].id.match(/user-list-user-(.*)/)[1];
      this.user_objects[user_id] = $(this.user_list[i]);
      this.user_names.push(this.user_objects[user_id].children("span").html());
    }.bind(this));
  };
  
  UserWidget.prototype = {
    // note to self: a more performant version would be:
    // send an integer identifier (update 102923)
    // if I received (update - 1) just do an incremental udpate
    // this would ensure data integrity and be very fast ;)
    "update": function(data) {
      var online_users = data["online_users"];
      for(var i in this.user_objects) {
        var current_dom_object = this.user_objects[i];
        var css_class = this.cssClassForConnections(online_users[i] && online_users[i]["connections"]);
        if(!current_dom_object.hasClass(css_class)) {
          current_dom_object.attr("class", css_class);
        }
      }
      
      this.sortEntries();
    },
    
    "cssClassForConnections": function(sockets) {
      if(!sockets) return 'offline';
      
      for(var x in sockets) {
        var socket = sockets[x][1];
        switch(socket)
        {
        case 'web':
          type = "online";
          break;
        case 'api':
          type = "api";
          break;
        }
        // web trumps socket, break if the user has a web connection
        if(type == 'web') break;
      };
      return type;
    },
    
    "sortEntries": function() {
      var user_list = $("#user-list ul.root");
      for(var e in this.user_objects) {
        if(this.user_objects[e].attr('class').match(/online/)) {
          user_list.prepend(this.user_objects[e]);
        }
      };
    },
    
    "updateWritingStatus": function(data) {
      var user_id = data["data"]["user_id"];
      var status  = data["data"]["status"];
      var current_dom_object = this.user_objects[user_id];
      if(current_dom_object && status == "writing") {
        if(!current_dom_object.hasClass("writing")) {
          current_dom_object.attr("class", "writing");
        }
      } else {
        if(!current_dom_object.hasClass("online")) {
          current_dom_object.attr("class", "online");
        }
      }
    }
   };
  
  return UserWidget;
  
})();