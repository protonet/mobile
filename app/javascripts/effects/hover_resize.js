//= require "../utils/to_max_size.js"
//= require "../media/proxy.js"

/**
 * Resizes an image when hovering
 *
 * TODO: this needs heavy refactoring since the code is outdated and buggy
 *
 * @constructor
 *
 * @param {Element} element jQuery reference to the image element that should be resized
 * @param {Object} [config]
 *    - newSrc:     Url to the image that should be shown while hovering
 *    - newSize:    Desired hover size (depends on natural size of the hover image when keepRatio == true)
 *    - proxy:      Whether the image should be proxied
 *    - keepRatio:  Whether the natural image size ratio of the hover image should be honored
 */
protonet.effects.HoverResize = function(element, config) {
  this.element = element;
  this.config = config || {};
  if (this.config.proxy && this.config.newSrc) {
    this.config.newSrc = protonet.media.Proxy.getImageUrl(this.config.newSrc, this.config.newSize);
  }
  
  this.element.hover(this._mouseOver.bind(this), this._mouseOut.bind(this));
};

protonet.effects.HoverResize.prototype = {
  _preload: function(callback) {
    if (!this.config.newSrc) {
      return callback();
    }
    
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
    
    tmpImg.src = this.config.newSrc;
  },
  
  _mouseOver: function() {
    this._over = true;
    
    this.config.oldSrc = this.element.attr("src");
    this.config.oldSize = this.config.oldSize || {
      height: this.element.height(),
      width:  this.element.width()
    };
    
    this._preload(function(naturalSize) {
      this.config.newSize = this.config.newSize || naturalSize;
      
      if (!this._over) {
        return;
      }
      
      if (this.config.keepRatio) {
        this.config.newSize = protonet.utils.toMaxSize(naturalSize, this.config.newSize);
      }
      
      if (this.config.newSize.height <= this.config.oldSize.height ||
          this.config.newSize.width <= this.config.oldSize.width) {
        return;
      }
      
      if (this.config.newSrc) {
        this.element.attr("src", this.config.newSrc);
      }
      
      this.element
        .stop()
        .css({
          "z-index": 10, "position": "absolute"
        })
        .animate({
          width: this.config.newSize.width.px(), height: this.config.newSize.height.px()
        }, "fast");
    }.bind(this));
  },
  
  _mouseOut: function() {
    this._over = false;
    
    this.element.stop().animate({
      width:  this.config.oldSize.width.px(),
      height: this.config.oldSize.height.px()
    }, "fast", function() {
      if (this.config.newSrc) {
        this.element.attr("src", this.config.oldSrc);
      }
      this.element.css({ "z-index": "", "position": "" });
    }.bind(this));
  }
};