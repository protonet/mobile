//= require "../../lib/jquery.contextMenu.js"

protonet.controls.FileWidget.prototype.FileContextMenu = function(parent) {
  this.parent = parent;
  this.container = parent.wrapper;
  this.update();
};

protonet.controls.FileWidget.prototype.FileContextMenu.prototype = {
  "update": function() {
    this.files = this.container.find("li.file > a");
    this.files.contextMenu({
      menu: "file-list-menu"
    }, function(action, el, pos) {
      this[action](el);
    }.bind(this));
  },
  
  "download": function(el) {
    window.open(el.attr("href"));
  },
  
  "delete": function(el) {
    var fileName = el.text();
    
    $.post('system/files/delete', {
      "file_name" : fileName,
      "file_path" : this.parent.fullPath(),
      "channel_id": this.parent.currentChannelId});
    el.remove();
    
    console.log('delete: ' + this.parent.getFilePathFor(fileName));
  },
  
  "publish": function(el) {
    var fileName = el.text();
    
    this.parent.publish(fileName);
    
    console.log('publish: ' + fileName);
  }
};