protonet.ui.Resizer = function(element, handle, options) {
  this.element = element;
  this.handle = handle;
  this.options = $.extend(options, {
    callback: $.noop,
    storage: window.localStorage || {},
    storageKey: "resize_height"
  });
  
  var storedHeight = this.options.storage[this.options.storageKey];
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
            newHeight = parseInt(this.element.css("height"), 10) + heightDiff;
        
        this.element.css("height", newHeight.px());
        currentPos = newPos;
        
        this.options.storage[this.options.storageKey] = newHeight;
        this.options.callback(newHeight);
      }.bind(this))
      
      .bind("mouseup", function() {
        currentPos = null;
      });
  }
};