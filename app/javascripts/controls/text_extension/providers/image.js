//= require "../../../effects/hover_resize.js"
//= require "../../../utils/parse_url.js"

/**
 * Image Provider
 */
protonet.controls.TextExtension.providers.Image = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Image.prototype = {
  REG_EXP: /.{13,}\.(jpg|jpeg|gif|png)(\?.*)*/i,
  MAX_SIZE: {
    width: 325,
    height: 325
  },
  
  match: function() {
    return this.REG_EXP.test(this.url)
      // Some wiki pages end with a typical image suffix (even though they are html pages)
      && this.url.indexOf("/File:") == -1;
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    // Check if it is an existent image
    var testImg = new Image();
    testImg.onerror = this._onFailure.bind(this, onFailureCallback);
    testImg.onload = function() {
      // Calculate width and height based on provided maximum size
      var width = testImg.naturalWidth,
          height = testImg.naturalHeight;
      if (width > this.MAX_SIZE.width) {
        height = height / 100 * (this.MAX_SIZE.width / (width / 100));
        width = this.MAX_SIZE.width;
      }
      if (height > this.MAX_SIZE.height) {
        width = width / 100 * (this.MAX_SIZE.height / (height / 100));
        height = this.MAX_SIZE.height;
      }
      this._onSuccess(onSuccessCallback, {
        width: width,
        height: height
      });
    }.bind(this);
    testImg.src = protonet.media.Proxy.getImageUrl(this.url);
  },
  
  _onSuccess: function(onSuccessCallback, previewSize) {
    if (this._canceled) {
      return;
    }
    
    var urlParts = protonet.utils.parseUrl(this.url);
    
    $.extend(this.data, {
      description:  urlParts.host,
      title:        urlParts.filename,
      previewSize:  previewSize
    });
    
    onSuccessCallback(this.data);
  },
  
  _onFailure: function(onFailureCallback) {
    if (this._canceled) {
      return;
    }
    
    onFailureCallback();
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  getDescription: function() {
    return String(this.data.description || "").truncate(75);
  },
  
  getTitle: function() {
    return String(this.data.title || "").truncate(75);
  },
  
  getMedia: function() {
    var thumbnailSize = {
      width: protonet.controls.TextExtension.config.IMAGE_WIDTH,
      height: protonet.controls.TextExtension.config.IMAGE_HEIGHT
    };
    
    var previewSize = this.data.previewSize;
    
    var thumbnail = protonet.media.Proxy.getImageUrl(this.url, thumbnailSize);
    var preview = protonet.media.Proxy.getImageUrl(this.url);
    
    var anchor = $("<a />", {
      href: this.url,
      target: "_blank"
    }).css({
      width: thumbnailSize.width.px(),
      height: thumbnailSize.height.px()
    });
    
    var img = $("<img />", $.extend({
      src: thumbnail
    }, thumbnailSize));
    
    new protonet.effects.HoverResize(img, previewSize, preview);
    
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};