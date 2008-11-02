function ChatUser(user, parent_widget) {
  var self = this;
  this.parent_widget = parent_widget;
  this.user_id = user.user_id;
  // for use in lists
  this.list_element = $(document.createElement("div"));
  this.list_element.addClass('user');
  // for use in messages
  this.message_element;
  // or something like that
}

ChatUser.prototype = { 
}
