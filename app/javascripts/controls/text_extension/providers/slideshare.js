//= require "../../../lib/webtoolkit.sha1.js"
//= require "../../../data/slideshare.js"

/**
 * Slideshare Provider
 */
protonet.controls.TextExtension.providers.Slideshare = function(url) {
  this.id = new Date().getTime() + Math.round(Math.random() * 1000);
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
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    protonet.data.SlideShare.getSlideShow(
      this.url,
      this._onSuccess.bind(this, onSuccessCallback, onEmptyResultCallback),
      this._onError.bind(this, onErrorCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, onEmptyResultCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var entry = response.query && response.query.results && response.query.results.Slideshow;
    if (!entry) {
      return onEmptyResultCallback(response);
    }
    
    $.extend(this.data, {
      description:  entry.Description,
      thumbnail:    entry.ThumbnailSmallURL,
      title:        entry.Title,
      embed_url:    $(entry.Embed).find("param[name=movie]").attr("value")
    });
    
    onSuccessCallback(this.data);
  },
  
  _onError: function(onErrorCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onErrorCallback(response);
  },
  
  _showVideo: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var placeholderId = "text-extension-media-" + this.id;
    $(event.target).attr("id", placeholderId);
    var params = {
      allowfullscreen: true,
      wmode: "opaque"
    };
    
    swfobject.embedSWF(
      this.data.embed_url,
      placeholderId,
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
    var thumbnail = this.data.thumbnail,
        anchor = $("<a />", {
          href: this.url,
          target: "_blank"
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

