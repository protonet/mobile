//= require "../../../lib/webtoolkit.sha1.js"
//= require "../../../data/slideshare.js"

/**
 * Slideshare Provider
 */
protonet.controls.TextExtension.providers.Slideshare = function(url) {
  this.url = url;
  this.data = {
    url: this.url,
    type: "Slideshare"
  };
};

protonet.controls.TextExtension.providers.Slideshare.prototype = {
  REG_EXP: /slideshare\.net\/[\w-]+?\/[\w-]+?$/i,
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    protonet.data.SlideShare.getSlideShow(
      this.url,
      this._onSuccess.bind(this, onSuccessCallback),
      this._onFailure.bind(this, onFailureCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    $.extend(this.data, {
      description:  response.Description,
      thumbnail:    response.ThumbnailSmallURL,
      title:        response.Title,
      embed_url:    $(response.Embed).find("param[name=movie]").attr("value")
    });
    
    onSuccessCallback(this.data);
  },
  
  _onFailure: function(onFailureCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onFailureCallback(response);
  },
  
  _showVideo: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var params = {
      allowfullscreen: true,
      wmode: "opaque"
    };
    
    swfobject.embedSWF(
      this.data.embed_url,
      this.id,
      "auto", "auto", "8",
      null, {}, params
    );
  },
  
  getDescription: function() {
    var description = this.data.description;
    description = description || this.url;
    return String(description).truncate(200);
  },
  
  getTitle: function() {
    return String(this.data.title).truncate(70);
  },
  
  getMedia: function() {
    this.id = "text-extension-media-" + new Date().getTime() + Math.round(Math.random() * 1000);
    var thumbnail = this.data.thumbnail,
        anchor = $("<a />", {
          href: this.url,
          target: "_blank",
          id: this.id
        }),
        img = $("<img />", {
          src: thumbnail,
          height: 90,
          width: 120
        });
    anchor.click(this._showVideo.bind(this));
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

