//= require "../utils/to_max_size.js"

protonet.effects.HoverResize = function(elementToResize, hoverSize, hoverSrc) {
  this.element = elementToResize;
  this.size = hoverSize;
  this.src = hoverSrc;
  
  this.element.hover(this._mouseOver.bind(this), this._mouseOut.bind(this));
};


protonet.effects.HoverResize.prototype = {
  _preload: function(callback) {
    if (!this.src) {
      return callback();
    }
    
    this.element.css("cursor", "wait");
    
    var tmpImg = new Image();
    tmpImg.onload = function() {
      callback({
        width: tmpImg.naturalWidth,
        height: tmpImg.naturalHeight
      });
      this.element.css("cursor", "");
    }.bind(this);
    tmpImg.onerror = function() {
      this.element.css("cursor", "");
    }.bind(this);
    tmpImg.src = this.src;
  },
  
  _mouseOver: function() {
    this._over = true;
    
    this.oldSrc = this.oldSrc || this.element.attr("src");
    this.oldSize = this.oldSize || {
      height: this.element.height(),
      width: this.element.width()
    };
    
    this._preload(function(naturalSize) {
      this.newSize = this.newSize || protonet.utils.toMaxSize((this.size || naturalSize), this.size);
      
      if (!this.newSize) {
        return;
      }
      
      if (!this._over) {
        return;
      }
      
      if (this.src) {
        this.element.attr("src", this.src);
      }
      
      this.element
        .stop()
        .css({ "z-index": 10, "position": "absolute" })
        .animate({ width: this.newSize.width.px(), height: this.newSize.height.px() }, "fast");
    }.bind(this));
  },
  
  _mouseOut: function() {
    this._over = false;
    
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