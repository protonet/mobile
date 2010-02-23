protonet.effects.HoverResize = function(elementToResize, hoverSize, hoverSrc) {
  this.element = elementToResize;
  this.size = hoverSize;
  this.src = hoverSrc;
  
  this.oldSize = {
    height: this.element.height(),
    width: this.element.width()
  };
  this.oldSrc = this.element.attr("src");
  
  this.element.hover(this._mouseOver.bind(this), this._mouseOut.bind(this));
};


protonet.effects.HoverResize.prototype = {
  _preload: function() {
    $("<img />").attr("src", this.src);
  },
  
  _mouseOver: function() {
    this._preload();
    
    clearTimeout(this.timeout);
    this.timeout = setTimeout(function() {
      if (this.src) {
        this.element.attr("src", this.src);
      }

      this.element
        .stop()
        .css({ "z-index": 10, "position": "absolute" })
        .animate({ width: this.size.width.px(), height: this.size.height.px() }, "fast");
    }.bind(this), 500);
  },
  
  _mouseOut: function() {
    clearTimeout(this.timeout);
    
    this.element.stop().animate({
      width: this.oldSize.width.px(),
      height: this.oldSize.height.px()
    }, "fast", function() {
      if (this.src) {
        this.element.attr("src", this.oldSrc);
      }
      
      this.element.css({ "z-index": "", "position": "" });
    }.bind(this));
  }
};