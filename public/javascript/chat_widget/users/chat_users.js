function ChatUser(user, parent_widget) {
  var self = this;
  this.parent_widget = parent_widget;
  this.id = user.id;
  this.name = user.name;
  // for use in lists
  this.list_element = $(document.createElement("div"));
  this.list_element.addClass('user');
  this.list_element.text(this.name);
  // for use in messages
  this.message_element;
  // or something like that
}

ChatUser.prototype = { 
}
