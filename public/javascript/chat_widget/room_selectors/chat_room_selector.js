function ChatRoomSelector(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';  
  this.selector_element = $(document.createElement('div'));
  this.selector_element.addClass('chat-room-selector')
  
  this._addOwnElementToParent();
} 

ChatRoomSelector.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.selector_element);
  }
}
