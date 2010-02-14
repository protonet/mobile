//= require "../../lib/jquery.contextMenu.js"

protonet.controls.FileWidget.prototype.FileContextMenu = function(parent) {
  this.parent = parent;
  this.container = $("#file-list");
  this.update();
  this.setClick();
};

protonet.controls.FileWidget.prototype.FileContextMenu.prototype = {
  "update": function() {
    this.files = this.container.find("li.file");
    this.files.contextMenu({
      menu: "file-list-menu"
    }, function(action, el, pos) {
      this[action](el);
    }.bind(this));
  },
  
  "setClick": function() {
    var self = this;
    this.files.die("click").live("click", function(event) {
      event.preventDefault();
      self.download($(this));
    });
  },
  
  "download": function(el) {
    if (el.hasClass("disabled")) {
      return;
    }
    
    var fileName = el.html(),
        downloadPath = this.parent.getDownloadPathFor(fileName);
    
    location.href = downloadPath;
    
    console.log('download: ' + downloadPath);
  },
  
  "delete": function(el) {
    var fileName = el.html(),
        filePath = this.parent.getFilePathFor(fileName);
    
    $.post('system/files/delete', {"file_path": filePath});
    el.remove();
    
    console.log('delete: ' + filePath);
  },
  
  "publish": function(el) {
    var fileName = el.html();
    
    this.parent.publish(fileName);
    
    console.log('publish: ' + fileName);
  }
};