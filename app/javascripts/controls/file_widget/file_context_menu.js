//= require "../../lib/jquery.contextMenu.js"

protonet.controls.FileWidget.prototype.FileContextMenu = function(parent) {
  this.parent = parent;
  this.files = $("#file-list li.file");
  this.initialize();
};

protonet.controls.FileWidget.prototype.FileContextMenu.prototype = {
  "initialize": function() {
    this.files.contextMenu({
      menu: "file-list-menu"
    },
    function(action, el, pos) {
      this[action](el);
    }.bind(this));
    
    var self = this;
    this.files.live("click", function() {
      self.download($(this));
    });
  },
  
  "download": function(el) {
    var fileName = el.html(),
        downloadPath = this.parent.getDownloadPathFor(fileName);
    
    if (protonet.user.Browser.IS_CHROME()) {
      // It's not possible to download other files when chrome opens file via location.href
      window.open(downloadPath);
    } else {
      location.href = downloadPath;
    }
    
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