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
   
  REG_EXP: new RegExp(protonet.config.base_url + "/.*\.(jpg|gif|png)", 'i'),
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    
    this.data.photos = [
    { title: this.title_from_url(this.url),
      thumbnail: {width: 75, height: 75, source: this.url},
      url:this.url,
      preview: {source: this.url, height: 200, width: 200}
    }];
    
    onSuccessCallback(this.data);
  },
  
  title_from_url: function(url) {
    return url.match(/.*\/.*%2F(.*)$/)[1] || 'untitled';
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
      thumbnail = protonet.media.Proxy.getImageUrl(protonet.config.base_url + photo.thumbnail.source, thumbnailSize);
      
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
        preview = photo.preview.source;
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

