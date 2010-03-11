//= require "../../../data/flickr.js"
//= require "../../../effects/hover_resize.js"


/**
 * Flickr Photo Ser Provider
 */
protonet.controls.TextExtension.providers.FlickrPhotoSet = function(url) {
  this.url = url;
  this.data = {
    url: this.url,
    title: "Flickr Photo Set"
  };
};

protonet.controls.TextExtension.providers.FlickrPhotoSet.prototype = {
  /**
   * Matches:
   * http://www.flickr.com/photos/lanphere/sets/72157594401592067/
   */
  REG_EXP: /flickr\.com\/photos\/.+?\/sets\/(\d{1,20})/i,
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this.REG_EXP)[1];
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    protonet.data.Flickr.getPhotoSet(
      this._extractId(),
      this._onSuccess.bind(this, onSuccessCallback),
      this._onFailure.bind(this, onFailureCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, photoDetails) {
    if (this._canceled) {
      return;
    }
    
    $.extend(this.data, { photos: photoDetails });
    
    onSuccessCallback(this.data);
  },
  
  _onFailure: function(onFailureCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onFailureCallback(response);
  },
  
  getDescription: function() {
    return $.map(this.data.photos, function(photo) {
      return photo.title;
    }).join(", ").truncate(180);
  },
  
  getTitle: function() {
    return String(this.data.title).truncate(70);
  },
  
  getMedia: function() {
    var container = $("<div />"), anchor, img, thumbnail, preview;
    $.each(this.data.photos, function(i, photo) {
      // TODO remove this "src" after some time, it's only here for backward compatibility reasons
      thumbnail = protonet.media.Proxy.getImageUrl(photo.thumbnail.source || photo.thumbnail.src);
      
      img = $("<img />", {
        src: thumbnail,
        title: photo.title,
        width: photo.thumbnail.width,
        height: photo.thumbnail.height
      });
      
      anchor = $("<a />", {
        href: photo.url,
        target: "_blank"
      }).css({
        width: photo.thumbnail.width.px(),
        height: photo.thumbnail.height.px()
      }).append(img);
            
      if (photo.preview) {
        preview = protonet.media.Proxy.getImageUrl(photo.preview.source);
        new protonet.effects.HoverResize(img, {
          height: photo.preview.height,
          width: photo.preview.width
        }, preview);
      }
      
      container.append(anchor);
    }.bind(this));
    
    return container;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

