function ChatUserList(room_id, parent_widget) {
  var self = this;
  this.room_id = room_id;
  this.parent_widget = parent_widget;
  this.users = [];
  this.list_element = $(document.createElement("div"));
}

ChatUserList.prototype = {
  "updateUsersWith": function(users) {
    for(var i in users) {
      if($(this.users).index(users[i])) {
        this.addUser(new ChatUser(users[i], this));
      }
    }
  },
  "addUser": function(user) {
    this.users.push(user);
    // console.log('added user ' + user.id);
    this.list_element.append(user.list_element);
  },
  "getUsers": function(callback_to_viewer) {
    var self = this;
    if(!this.block_get) {
      $.get("/chat_users/index", {"room_id": this.room_id}, function(users){
        users = eval(users);
        self.updateUsersWith(users);
        if(callback_to_viewer) {
          self.parent_widget.usersLoadedCallback(self.room_id);
        }
      });
    }
  }
}
