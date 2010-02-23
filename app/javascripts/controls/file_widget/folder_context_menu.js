//= require "../../lib/jquery.contextMenu.js"

protonet.controls.FileWidget.prototype.FolderContextMenu = function(parent) {
  this.parent = parent;
  this.container = parent.wrapper;
  this.update();
  this.setClick();
};

protonet.controls.FileWidget.prototype.FolderContextMenu.prototype = {
  "update": function() {
    this.folders = this.container.find("li.directory > a");
    this.folders.contextMenu({
      menu: "folder-list-menu"
    }, function(action, el, pos) {
      this[action](el);
    }.bind(this));
  },
  
  "setClick": function() {
    var self = this;
    this.folders.die("click").live("click", function(event) {
      event.preventDefault();
      self.open($(this));
    });
  },
  
  "open": function(el) {
    this.parent.moveDown(el.text());
  },
  
  "delete": function(el) {
    var folderName = el.text();
    
    $.post('system/files/delete_directory', {
      file_path: this.parent.current_path,
      directory_name: folderName
    });
    el.remove();
  }
};