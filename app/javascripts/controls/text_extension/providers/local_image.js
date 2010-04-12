//= require "../../../utils/parse_url.js"
// protonet.controls.TextExtension.Renderer($('#text-extension-preview'), {"type":"fooo"}, new protonet.controls.TextExtension.providers.LocalImage('bla'))


/**
 * Flickr Photo Ser Provider
 */
protonet.controls.TextExtension.providers.LocalImage = function(url) {
  this.url = url;
  this.data = {
    url: this.url,
    title: "Images on this node"
  };
};

protonet.controls.TextExtension.providers.LocalImage.prototype = {
  
  /**
   * Matches:
   * http://global.protonet.com/xyz.jpg or gif or png
   */
  REG_EXP: /.*\.(jpe?g|gif|png)/i,
  
  match: function() {
    if (!this.url.toLowerCase().startsWith(protonet.config.base_url.toLowerCase())) {
      return false;
    }
    var urlParts = protonet.utils.parseUrl(this.url);
    return this.REG_EXP.test(urlParts.filename);
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    
    this.data.photos = [{ 
      title: this.titleFromUrl(this.url),
      url:this.url
    }];
    
    onSuccessCallback(this.data);
  },
  
  titleFromUrl: function(url) {
    return protonet.utils.parseUrl(url).filename || 'untitled';
  },

  setData: function(data) {
     this.data = data;
  },
  
  getDescription: function() {
    return $.map(this.data.photos, function(photo) {
      return photo.title;
    }).join(", ").truncate(180);
  },
  
  getTitle: function() {
    return "Images on this node";
  },
  
  getMedia: function() {
    var container = $("<div />"), anchor, img, thumbnail, preview;
    $.each(this.data.photos, function(i, photo) {
      var thumbnailSize = {
        width: protonet.controls.TextExtension.config.IMAGE_WIDTH,
        height: protonet.controls.TextExtension.config.IMAGE_HEIGHT
      };
      thumbnail = protonet.media.Proxy.getImageUrl(protonet.config.base_url + photo.url, thumbnailSize);
      
      img = $("<img />", {
        src: thumbnail,
        title: photo.title,
        width: thumbnailSize.width,
        height: thumbnailSize.height
      });
      
      anchor = $("<a />", {
        href: photo.url,
        target: "_blank"
      }).css({
        width: protonet.controls.TextExtension.config.IMAGE_WIDTH.px(),
        height: protonet.controls.TextExtension.config.IMAGE_HEIGHT.px()
      }).append(img);
            
      new protonet.effects.HoverResize(img, {
        height: 325,
        width: 325
      }, photo.url);
      
      container.append(anchor);
    }.bind(this));
    
    return container;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

