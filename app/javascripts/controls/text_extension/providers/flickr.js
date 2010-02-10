//= require "../../../data/flickr.js"
//= require "../../../effects/hover_resize.js"


/**
 * Flickr Provider
 */
protonet.controls.TextExtension.providers.Flickr = function(url) {
  this.url = url;
  this.data = {
    url: this.url,
    type: "Flickr"
  };
  this._regExp = /flickr\.com\/photos\/[\w@]+?\/(\d{1,20})/i;
};

protonet.controls.TextExtension.providers.Flickr.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this._regExp)[1];
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    protonet.data.Flickr.getPhoto(
      this._extractId(),
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
    
    $.extend(this.data, photoDetails);
    
    onSuccessCallback(this.data);
  },
  
  _onError: function(onErrorCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onErrorCallback(response);
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
    var anchor = $("<a />", {
          href: this.url,
          target: "_blank"
        }).css({
          width: this.data.thumbnail.width.px(),
          height: this.data.thumbnail.height.px()
        }),
        img = $("<img />", {
          // TODO remove this "src" after some time, it's only here for backward compatibility reasons
          src: this.data.thumbnail.source || this.data.thumbnail.src
        }).attr({
          width: this.data.thumbnail.width,
          height: this.data.thumbnail.height
        });
    
    if (this.data.preview) {
      new protonet.effects.HoverResize(img, {
        height: this.data.preview.height,
        width: this.data.preview.width
      }, this.data.preview.source);
    }
    
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

