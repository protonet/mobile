protonet.ui.Resizer = function(element, handle) {
  this.element = element;
  this.handle = handle;
  this._observe();
};

protonet.ui.Resizer.prototype = {
  _observe: function() {
    this.handle
      .bind("mousedown", function() {
        console.log(1);
      })
      
      .bind("mousemove", function() {
        console.log(2);
      })
      
      .bind("mouseup", function() {
        console.log(3);
      });
  }
};