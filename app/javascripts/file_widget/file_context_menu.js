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
        // debugger;
        alert(
          "Action: " + action + "\n\n" +
          "Element ID: " + $(el).attr("id") + "\n\n" +
          "X: " + pos.x + "  Y: " + pos.y + " (relative to element)\n\n" +
          "X: " + pos.docX + "  Y: " + pos.docY+ " (relative to document)"
          );
    });
  }
}