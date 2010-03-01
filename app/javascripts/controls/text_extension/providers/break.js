//= require "../../../data/meta_data.js"

/**
 * Break.com Provider
 */
protonet.controls.TextExtension.providers.Break = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Break.prototype = {
  REG_EXP: /break\.com\/.+?\/.+/i,
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
    var thumbnail = this.data.image_src,
        anchor = $("<a />", {
          href: this.url,
          target: "_blank",
          id: this.id
        }),
        img = $("<img />", {
          src: this.data.image_src,
          width: 150,
          height: 100
        });
    
    if (this.data.video_src) {
      anchor.click(this._showVideo.bind(this));
    }
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

