function ChatInput(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
  this.input_element = $(document.createElement('input'));
  
  this._addOwnElementToParent();
  
  this.input_element.attr('size', 60) ; 
}

ChatInput.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.input_element);
  },
  "renderFor": function(room_id) {
    this.active_room_id = room_id;
  }
}
