protonet.ui.Resizer = function(element, handle, options) {
  this.element = element;
  this.handle = handle;
  this.options = $.extend({
    callback: $.noop,
    storageKey: "resize_height"
  }, options);
  
  var storedHeight = protonet.storage.get(this.options.storageKey);
  storedHeight && this.element.css("height", storedHeight.px());
  
  this._observe();
};

protonet.ui.Resizer.prototype = {
  _observe: function() {
    var currentPos = null;
    
    this.handle.bind("mousedown", function(event) {
      currentPos = event.pageY;
    });
    
    $("body")
      .bind("mousemove", function(event) {
        if (currentPos === null) {
          return;
        }
        
        var newPos = event.pageY,
            heightDiff = (newPos - currentPos),
            newHeight = this.element.cssUnit("height")[0] + heightDiff;
        
        this.element.css("height", newHeight.px());
        currentPos = newPos;
        
        protonet.storage.set(this.options.storageKey, newHeight);
        this.options.callback(newHeight);
      }.bind(this))
      
      .bind("mouseup", function() {
        currentPos = null;
      });
  }
};