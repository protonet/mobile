protonet.controls.FileWidget.prototype.FileContextMenu = function(parent) {
  this.parent = parent;
  this.initialize();
}

protonet.controls.FileWidget.prototype.FileContextMenu.prototype = {
  "initialize": function() {
    var self = this;
    $("#file-list li").contextMenu({
      menu: "file-list-menu"
    },
      function(action, el, pos) {
        var current_file_path = self.parent.current_path + '/' + el.html();
        switch(action)
        {
        case 'download':
          console.log('download: ' + current_file_path);
          break;
        case 'delete':
          console.log('delete: ' + current_file_path);
          break;
        }
    });
  }
}