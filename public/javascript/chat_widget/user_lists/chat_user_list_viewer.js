function ChatUserListViewer(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
  this.view_element = $(document.createElement('div'));
  this.view_element.addClass('chat-user-list')
  
  this._addOwnElementToParent();
};

ChatUserListViewer.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.view_element);
  },
  "createOrReturnChatUserList": function(room_id) {
    var room_key = 'room_' + room_id;
    if(!this.parent_widget.user_lists[room_key]) {
      this.parent_widget.user_lists[room_key] = new ChatUserList(room_id, this);
    }
    return this.parent_widget.user_lists[room_key];
  },
  "setActive": function(room_id) {
    user_list = this.createOrReturnChatUserList(room_id);
    user_list.getUsers(true);
    this.view_element.append(this.parent_widget.activeUserList().list_element);
  }
};