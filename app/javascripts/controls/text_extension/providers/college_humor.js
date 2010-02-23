//= require "../../../data/meta_data.js"

/**
 * CollegeHumor.com Provider
 */
protonet.controls.TextExtension.providers.CollegeHumor = function(url) {
  this.id = new Date().getTime() + Math.round(Math.random() * 1000);
  this.url = url;
  this.data = {
    url: this.url,
    type: "CollegeHumor"
  };
};

protonet.controls.TextExtension.providers.CollegeHumor.prototype = {
  REG_EXP: /collegehumor\.com\/video\:\d+/i,
  
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
    if (!this.data.video_src) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    var placeholderId = "text-extension-media-" + this.id;
    $(event.target).attr("id", placeholderId);
    var params = {
      allowfullscreen: true,
      wmode: "opaque"
    };
    
    swfobject.embedSWF(
      this.data.video_src,
      placeholderId,
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
    var thumbnail = this.data.image_src,
        anchor = $("<a />", {
          href: this.url,
          target: "_blank"
        }),
        img = $("<img />", {
          src: this.data.image_src,
          width: 150,
          height: 100
        });
    anchor.click(this._showVideo.bind(this));
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

