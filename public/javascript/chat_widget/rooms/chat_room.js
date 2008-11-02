function ChatRoom(room_id, parent_widget) {
  var self = this;
  this.room_id = room_id;
  this.parent_widget = parent_widget;
  this.messages = [];
  this.block_get = false;
  this.room_element = $(document.createElement("div"));
}

ChatRoom.prototype = {
  "getLastMessages": function(callback_to_viewer) {
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
  },
  "receivedMessageIds": function() {
    if(this.messages.length == 0) {
      return this.messages
    }
    return $.map(this.messages, function(m){return m.id});
  },
  "appendMessage": function(message) {
    this.messages.push(message);
    this.room_element.append(message.wrapper_element);
  }
}
