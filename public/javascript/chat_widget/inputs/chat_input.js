function ChatInput(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
  this.input_element = $(document.createElement('input'));
  
  this.block_get = false;
  
  this._addOwnElementToParent();
  
  this.input_element.attr('size', 60) ; 
}

ChatInput.prototype = {
  "setupKeyListener": function() {
    var self = this;
    this.input_element.bind('keypress', function(e){ 
      if(e.which == 13) {
        var current_user_id = self.parent_widget.current_user_id;
        var active_room = self.parent_widget.activeRoom();
        var message = new ChatMessage({"text": self.input_element.val(), "room_id": active_room.room_id, "user_id": current_user_id}, active_room);
        active_room.appendMessage(message);
        self.sendMessage(message);
        self.input_element.val('');
      }
    });
    
  },
  "sendMessage": function(message) {
    var self = this;
    // this.block_get = true;
    $.post("/chat_messages", { "room_id": message.room_id, "user_id": message.user_id, "text" : message.text } );
  },
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.input_element);
  },
  "renderFor": function(room_id) {
    this.active_room_id = room_id;
  },
  "setActive": function(room_id) {
    this.setupKeyListener();
  }
}
