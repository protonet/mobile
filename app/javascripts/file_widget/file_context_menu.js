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
    this.files.click(function(event) {
      self.download($(this));
    });
  },
  
  "download": function(el) {
    var current_file_path = this._getFilePathFor(el);
    console.log('download: ' + current_file_path);
    document.location = "system/files/show?file_path=" + encodeURIComponent(current_file_path);
  },
  
  "delete": function(el) {
    var current_file_path = this._getFilePathFor(el);
    console.log('delete: ' + current_file_path);
    $.post('system/files/delete', {"file_path": current_file_path});
    el.remove();
  },
  
  "_getFilePathFor": function(el) {
    return this.parent.current_path + '/' + el.html();
  }
};