//= require "../../../data/meta_data.js"

/**
 * MetaCafe Provider
 */
protonet.controls.TextExtension.providers.Metacafe = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Metacafe.prototype = {
  /**
   * Matches
   * http://www.metacafe.com/watch/4248798/double_snowmobile_fail/
   */
  REG_EXP: /metacafe\.com\/watch\/.+\//i,
  CLASS_NAME: "flash-video",
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    protonet.data.MetaData.get(
      this.url, this._onSuccess.bind(this, onSuccessCallback, onFailureCallback), this._onFailure.bind(this, onFailureCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onFailure: function(onFailureCallback) {
    if (this._canceled) {
      return;
    }
    
    onFailureCallback();
  },
  
  _onSuccess: function(onSuccessCallback, onFailureCallback, response) {
    if (this._canceled) {
      return;
    }
    
    this.data = $.extend({}, response, this.data);
    
    if (this.data.image_src) {
      onSuccessCallback(this.data);
    } else {
      onFailureCallback();
    }
  },
  
  _showVideo: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var params = {
      allowfullscreen: true,
      wmode: "opaque"
    };
    
    swfobject.embedSWF(
      this.data.video_src,
      this.id,
      "auto", "auto", "8",
      null, {}, params
    );
  },
  
  getDescription: function() {
    return String(this.data.description || "").truncate(200);
  },
  
  getTitle: function() {
    return String(this.data.title || "").truncate(70);
  },
  
  getMedia: function() {
    this.id = "text-extension-preview-" + new Date().getTime() + Math.round(Math.random() * 1000);
    var thumbnailSize = {
      width: protonet.controls.TextExtension.config.IMAGE_WIDTH,
      height: protonet.controls.TextExtension.config.IMAGE_HEIGHT
    };
    var thumbnail = protonet.media.Proxy.getImageUrl(this.data.image_src, thumbnailSize);
    
    var anchor = $("<a />", {
      href: this.url,
      target: "_blank",
      id: this.id
    });
    
    var img = $("<img />", $.extend({
      src: thumbnail
    }, thumbnailSize));
    
    if (this.data.video_src) {
      anchor.click(this._showVideo.bind(this));
    }
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

