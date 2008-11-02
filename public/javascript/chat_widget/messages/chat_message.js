function ChatMessage(message, parent_widget) {
  var self = this;
  this.parent_widget = parent_widget;
  this.text = message.text;
  this.wrapper_element = $(document.createElement("div"));
  this.wrapper_element.addClass('message');
  
  this.image_element = $(document.createElement("img"));
  this.text_element  = $(document.createElement("p"));
  this.text_element.html(this.text);
  
  this.wrapper_element.append(this.image_element);
  this.wrapper_element.append(this.text_element);
}

ChatMessage.prototype = {
}
