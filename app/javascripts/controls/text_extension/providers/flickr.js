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
};

protonet.controls.TextExtension.providers.Flickr.prototype = {
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

