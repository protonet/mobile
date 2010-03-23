//= require "../../../data/meta_data.js"
//= require "../../../media/screenshot.js"
//= require "../../../effects/hover_resize.js"
//= require "../../../utils/parse_url.js"
//= require "../../../utils/strip_tags.js"
//= require "../../../utils/strip_tracking_params.js"

/**
 * WebLink Provider
 */
protonet.controls.TextExtension.providers.Link = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Link.prototype = {
  thumbnailSize: {
    width: protonet.controls.TextExtension.config.IMAGE_WIDTH,
    height: protonet.controls.TextExtension.config.IMAGE_HEIGHT
  },
  
  previewSize: {
     width: 280,
     height: 200
  },
  
  match: function() {
    return !!this.url;
  },
  
  loadData: function(onSuccessCallback) {
    this.queryUrl = protonet.utils.stripTrackingParams(this.url);
    this.data.thumbnail = protonet.media.ScreenShot.get(this.queryUrl);
    
    // Ok google, doesn't know anything about the given url, so we try to get our own data using YQL html lookup
    protonet.data.MetaData.get(
      this.queryUrl, this._onSuccess.bind(this, onSuccessCallback), this._onSuccess.bind(this, onSuccessCallback)
    );
  },
  
  _onSuccess: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var urlParts = protonet.utils.parseUrl(this.queryUrl),
        shortUrl = urlParts.host + urlParts.path + urlParts.query;
    
    this.data = $.extend({
      title: shortUrl
    }, response, this.data);
    
    onSuccessCallback(this.data);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  getDescription: function() {
    return String(this.data.description || this.data.keywords || "").truncate(200);
  },
  
  getTitle: function() {
    return String(this.data.title || "").truncate(75);
  },
  
  getMedia: function() {
    if (this.data.image_src && String(this.data.image_src).isUrl()) {
      return this._getMediaByImageSrc();
    } else {
      return this._getMediaByScreenShot();
    }
  },
  
  _getMediaByImageSrc: function() {
    var thumbnail = this.data.image_src;
    
    var anchor = $("<a />", {
      href: this.url,
      target: "_blank"
    });
    
    var img = $("<img />", $.extend({
      src: protonet.media.Proxy.getImageUrl(thumbnail, this.thumbnailSize)
    }, this.thumbnailSize));
    
    new protonet.effects.HoverResize(img, this.previewSize, protonet.media.Proxy.getImageUrl(thumbnail));
    
    return anchor.append(img);
  },
  
  _getMediaByScreenShot: function() {
    var thumbnail = this.data.thumbnail;
    var thumbnailReady = thumbnail + "&loaded";
    
    var anchor = $("<a />", {
      href: this.url,
      target: "_blank",
      className: "fetching"
    });
    
    var img;
    
    var renderImage = function(screenShotUrl) {
      if (!img) {
        img = $("<img />", this.thumbnailSize).appendTo(anchor);
      }
      img.attr("src", protonet.media.Proxy.getImageUrl(screenShotUrl, this.thumbnailSize));
    };
    
    var observeImage = function(previewScreenShotUrl) {
      new protonet.effects.HoverResize(img, this.previewSize, previewScreenShotUrl);
    }.bind(this);
    
    var hideIndicator = function() {
      anchor.removeClass("fetching");
    };
    
    var renderAndObserveImage = function() {
      var previewUrl = protonet.media.Proxy.getImageUrl(thumbnailReady, this.previewSize);
      
      renderImage(thumbnailReady);
      hideIndicator();
      observeImage(previewUrl);
    }.bind(this);
    
    var hideIndicatorAndObserveImage = function() {
      var previewUrl = protonet.media.Proxy.getImageUrl(thumbnail, this.previewSize);
      
      hideIndicator();
      observeImage(previewUrl);
    }.bind(this);
    
    protonet.media.Proxy.isImageAvailable(thumbnailReady, function(status) {
      if (status) {
        return renderAndObserveImage();
      }
      
      renderImage(thumbnail);
      protonet.media.ScreenShot.fetch(this.url, null, {
        success: renderAndObserveImage,
        failure: hideIndicatorAndObserveImage
      });
    }.bind(this));
    
    return anchor;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};