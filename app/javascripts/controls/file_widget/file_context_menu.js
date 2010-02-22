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
    location.href = el.attr("href");
  },
  
  "delete": function(el) {
    var fileName = el.text(),
        filePath = this.parent.getFilePathFor(fileName);
    
    $.post('system/files/delete', {"file_path": filePath});
    el.remove();
    
    console.log('delete: ' + filePath);
  },
  
  "publish": function(el) {
    var fileName = el.text();
    
    this.parent.publish(fileName);
    
    console.log('publish: ' + fileName);
  }
};