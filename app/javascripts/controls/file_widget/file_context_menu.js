//= require "../../lib/jquery.contextMenu.js"

protonet.controls.FileWidget.prototype.FileContextMenu = function(parent) {
  this.parent = parent;
  this.container = $("#file-list");
  this._createIframe();
  this.update();
  this.setClick();
};

protonet.controls.FileWidget.prototype.FileContextMenu.prototype = {
  "_createIframe": function() {
    /**
     * We need an iframe for openening the downloads to avoid problems
     * with the socket connection
     */
    this._iframe = $("<iframe />", {
      src: "javascript:'<html></html>'",
      frameborder: 0,
      width: 1,
      height: 1,
      className: "hidden-iframe"
    });
    $("body").append(this._iframe);
  },
  
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
    this.files.live("click", function() {
      self.download($(this));
    });
  },
  
  "download": function(el) {
    if (el.hasClass("disabled")) {
      return;
    }
    
    var fileName = el.html(),
        downloadPath = this.parent.getDownloadPathFor(fileName);
    
    this._iframe.get(0).contentWindow.location.replace(downloadPath);
    
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