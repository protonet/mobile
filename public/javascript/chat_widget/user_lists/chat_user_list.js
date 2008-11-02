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
      if($.index(this.users, users[i])) {
        this.addUser(new ChatUser(users[i], this));
      }
    }
  },
  "addUser": function(user) {
    this.users.push(user);
    console.log('foo');
    this.list_element.append(user.list_element);
  },
  "getUsers": function(callback_to_viewer) {
    var self = this;
    if(!this.block_get) {
      $.get("/chat_messages/index", {"room_id": this.room_id, "received_message_ids[]": this.receivedMessageIds()}, function(messages){
        messages = eval(messages);
        for(var i in messages) {
          self.appendMessage(new ChatMessage(messages[i], self));
        }
        if(callback_to_viewer) {
          self.parent_widget.messagesLoadedCallback(self.room_id);
        }
      });
    }
  }
}
