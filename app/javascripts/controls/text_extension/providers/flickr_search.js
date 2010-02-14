//= require "../../../data/flickr.js"
//= require "../../../effects/hover_resize.js"


/**
 * Flickr Photo Set Provider
 */
protonet.controls.TextExtension.providers.FlickrSearch = function(url) {
  this.url = url;
  this.data = {
    type: "FlickrSearch",
    url: this.url
  };
  this._regExp = /flickr\.com\/search\/.*[\?&]q\=(.+?)($|&)/i;
};

protonet.controls.TextExtension.providers.FlickrSearch.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },
  
  _extractQuery: function() {
    return decodeURIComponent(this.url.match(this._regExp)[1].replace(/\+/g, " "));
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    protonet.data.Flickr.getPhotoSearch(
      this._extractQuery(),
      this._onSuccess.bind(this, onSuccessCallback, onEmptyResultCallback),
      this._onError.bind(this, onErrorCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, onEmptyResultCallback, photoDetails) {
    if (this._canceled) {
      return;
    }
    
    $.extend(this.data, {
      title: "Search results for '" + this._extractQuery() + "'",
      photos: photoDetails
    });
    
    onSuccessCallback(this.data);
  },
  
  _onError: function(onErrorCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onErrorCallback(response);
  },
  
  getDescription: function() {
    return $.map(this.data.photos, function(photo) {
      return photo.title;
    }).join(", ").truncate(240);
  },
  
  getTitle: function() {
    return String(this.data.title).truncate(70);
  },
  
  getMedia: function() {
    var container = $("<div />"), anchor, img;
    $.each(this.data.photos, function(i, photo) {
      img = $("<img />", {
        // TODO remove this "src" after some time, it's only here for backward compatibility reasons
        src: photo.thumbnail.source || photo.thumbnail.src,
        title: photo.title
      }).attr({
        width: photo.thumbnail.width,
        height: photo.thumbnail.height
      });
      anchor = $("<a />", {
        href: photo.url,
        target: "_blank"
      }).append(img);
      
      if (photo.preview) {
        new protonet.effects.HoverResize(img, {
          height: photo.preview.height,
          width: photo.preview.width
        }, photo.preview.source);
      }
      
      container.append(anchor);
    }.bind(this));
    
    return container;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

