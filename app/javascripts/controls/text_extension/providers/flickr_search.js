//= require "../../../data/flickr.js"


/**
 * Flickr Photo Ser Provider
 */
protonet.controls.TextExtension.providers.FlickrSearch = function(url) {
  this.url = url;
  this.data = {};
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
    
    this.data = {
      type: "FlickrSearch",
      url: this.url,
      title: "Search for '" + this._extractQuery() + "'",
      photos: photoDetails
    };
    
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
    }).join(", ");
  },
  
  getTitle: function() {
    return String(this.data.title).truncate(70);
  },
  
  getMedia: function() {
    var container = $("<div />"), anchor, img;
    $.each(this.data.photos, function(i, photo) {
      img = $("<img />", {
        src: photo.thumbnail.src,
        title: photo.title
      });
      anchor = $("<a />", {
        href: this.url,
        target: "_blank"
      }).append(img);
      
      container.append(anchor);
    }.bind(this));
    
    return container;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

