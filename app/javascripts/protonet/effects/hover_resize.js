//= require "../utils/to_max_size.js"

/**
 * Resizes an image when hovering
 *
 * @constructor
 *
 * @param {Element} element jQuery reference to the image element that should be resized
 * @param {String} newSrc New image source
 */
protonet.effects.HoverResize = Class.create({
  initialize: function(element, options) {
    this.element = element;
    this.newSrc  = options.newSrc;
    this.newSize = options.newSize;
    this.element.hover(this._mouseOver.bind(this), this._mouseOut.bind(this));
  },
  
  _preload: function(callback) {
    this.element.css("cursor", "wait");
    
    var tmpImg = new Image();
    tmpImg.onload = function() {
      callback({
        width:  tmpImg.width,
        height: tmpImg.height
      });
      this.element.css("cursor", "");
    }.bind(this);
    tmpImg.onerror = function() {
      this.element.css("cursor", "");
    }.bind(this);
    
    tmpImg.src = this.newSrc;
  },
  
  _mouseOver: function() {
    this._over = true;
    
    this.oldSrc = this.element.attr("src");
    this.oldSize = this.oldSize || {
      height: this.element.height(),
      width:  this.element.width()
    };
    
    this._preload(function(newSize) {
      if (!this._over) {
        return;
      }
      
      if (this.newSize) {
        newSize = protonet.utils.toMaxSize(newSize, this.newSize);
      }
      
      if (newSize.height <= this.oldSize.height ||
          newSize.width <= this.oldSize.width) {
        return;
      }
      
      this.element.attr("src", this.newSrc);
      
      this.element
        .stop()
        .css({
          zIndex: 10, position: "absolute", imageRendering: "optimizeQuality"
        })
        .animate({
          width: newSize.width.px(), height: newSize.height.px()
        }, "fast");
    }.bind(this));
  },
  
  _mouseOut: function() {
    this._over = false;
    
    this.element.stop().animate({
      width:  this.oldSize.width.px(),
      height: this.oldSize.height.px()
    }, "fast", function() {
      this.element
        .attr("src", this.oldSrc)
        .css({ "z-index": "", "position": "" });
    }.bind(this));
  }
});