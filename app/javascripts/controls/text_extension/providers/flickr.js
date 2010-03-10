//= require "../../../data/flickr.js"
//= require "../../../effects/hover_resize.js"


/**
 * Flickr Provider
 */
protonet.controls.TextExtension.providers.Flickr = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Flickr.prototype = {
  /**
   * Matches:
   * http://www.flickr.com/photos/phil76/4307719822/
   */
  REG_EXP: /flickr\.com\/photos\/[\w@-_]+?\/(\d{1,20})/i,
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this.REG_EXP)[1];
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    protonet.data.Flickr.getPhoto(
      this._extractId(),
      this._onSuccess.bind(this, onSuccessCallback, onFailureCallback),
      this._onFailure.bind(this, onFailureCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, onFailureCallback, photoDetails) {
    if (this._canceled) {
      return;
    }
    
    $.extend(this.data, photoDetails);
    
    onSuccessCallback(this.data);
  },
  
  _onFailure: function(onFailureCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onFailureCallback(response);
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
    var thumbnailSize = {
      width: protonet.controls.TextExtension.config.IMAGE_WIDTH, // fixed width
      height: this.data.thumbnail.height
    };
    
    var previewSize = {
      height: this.data.preview.height,
      width: this.data.preview.width
    };
    
    // TODO remove this ".src" after some time, it's only here for backward compatibility reasons
    var thumbnail = protonet.media.Proxy.getImageUrl(this.data.thumbnail.source || this.data.thumbnail.src, thumbnailSize);
    
    var anchor = $("<a />", {
      href: this.url,
      target: "_blank"
    }).css({
      // Needed for the hover effect to work
      width: thumbnailSize.width.px(),
      height: thumbnailSize.height.px()
    });
    
    var img = $("<img />", $.extend({
      src: thumbnail
    }, thumbnailSize));
    
    if (this.data.preview) {
      var preview = protonet.media.Proxy.getImageUrl(this.data.preview.source, previewSize);
      new protonet.effects.HoverResize(img, previewSize, preview);
    }
    
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

