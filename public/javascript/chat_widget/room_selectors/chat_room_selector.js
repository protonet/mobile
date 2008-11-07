function ChatRoomSelector(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';  
  this.selector_element = $(document.createElement('div'));
  this.selector_element.addClass('chat-room-selector')
  
  this._addOwnElementToParent();
  
  this.block_get = false;
} 

ChatRoomSelector.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.selector_element);
  },
  "setActive": function() {
    
  },
  "getAvailableRooms": function() {
    var self = this;
    if(!this.block_get) {
      $.get("/chat_rooms/index", {}, function(rooms){
        rooms = eval(rooms);
        for(var i in rooms) {
          self.parent_widget.addRoom(new ChatRoom(messages[i], self));
        }
        if(callback_to_viewer) {
          self.parent_widget.messagesLoadedCallback(self.room_id);
        }
      });
    }
  }
}
