protonet.controls.UserWidget = (function() {

  function UserWidget(args) {
    this.user_list = $("#user-list li");
    this.user_objects = {};
    this.user_list.each(function(i){
      var user_id = this.user_list[i].id.match(/user-list-user-(.*)/)[1];
      this.user_objects[user_id] = $(this.user_list[i]);
    }.bind(this));
  };
  
  UserWidget.prototype = {
    "update": function(data) {
      online_users = data["online_users"];
      for(var i in this.user_objects) {
        var current_dom_object = this.user_objects[i];
        if(online_users[i]) {
          if(!current_dom_object.hasClass("online")) {
            current_dom_object.addClass("online");
          }
        } else {
          current_dom_object.removeClass("online");
        }
      };
    }
  };
  
  return UserWidget;
  
})();