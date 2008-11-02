function ChatRoomViewer(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
  this.view_element = $(document.createElement('div'));
  this.view_element.addClass('chat-room-viewer')
  
  this._addOwnElementToParent();
};

ChatRoomViewer.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.view_element);
  },
  "createOrReturnRoom": function(room_id) {
    var room_key = 'room_' + room_id;
    if(!this.parent_widget.rooms[room_key]) {
      this.parent_widget.rooms[room_key] = new ChatRoom(room_id, this);
    }
    return this.parent_widget.rooms[room_key];
  },
  "setActive": function(room_id) {
    room = this.createOrReturnRoom(room_id);
    room.getLastMessages(true);
    this.view_element.append(this.parent_widget.activeRoom().room_element);
  },
  "scrollToLast": function() {
    this.view_element.scrollTo(this.parent_widget.activeRoom().room_element.children('.message:last'));
  },
  "messagesLoadedCallback": function(room_id) {
    this.parent_widget.active_room_id = room_id;
    this.scrollToLast();
  }
};