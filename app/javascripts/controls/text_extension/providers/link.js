//= require "../../../data/meta_data.js"
//= require "../../../data/google.js"
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
  match: function() {
    return !!this.url;
  },
  
  loadData: function(onSuccessCallback) {
    this.queryUrl = protonet.utils.stripTrackingParams(this.url);
    this.data.thumbnail = protonet.media.ScreenShot.get(this.queryUrl);
    
    protonet.data.Google.search(
      this.queryUrl,
      this._googleSearchCallback.bind(this, onSuccessCallback),
      this._googleSearchFailureCallback.bind(this, onSuccessCallback)
    );
  },
  
  _googleSearchCallback: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var result = response[0];
    $.extend(this.data, {
      description:  protonet.utils.stripTags(result.content || ""),
      title:        protonet.utils.stripTags(result.title || "")
    });
    
    onSuccessCallback(this.data);
  },
  
  _googleSearchFailureCallback: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    // Ok google, doesn't know anything about the given url, so we try to get our own data using YQL html lookup
    protonet.data.MetaData.get(
      this.queryUrl, this._yqlCallback.bind(this, onSuccessCallback), this._yqlCallback.bind(this, onSuccessCallback)
    );
  },
  
  _yqlCallback: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var urlParts = protonet.utils.parseUrl(this.queryUrl),
        shortUrl = urlParts.host + urlParts.path + urlParts.query;
    
    $.extend(this.data, {
      description:  response.description || "",
      tags:         response.keywords || "",
      title:        response.title || shortUrl
    });
    
    onSuccessCallback(this.data);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  getDescription: function() {
    return String(this.data.description || "").truncate(200);
  },
  
  getTitle: function() {
    return String(this.data.title || "").truncate(75);
  },
  
  getMedia: function() {
    var thumbnail = this.data.thumbnail;
    var thumbnailReady = thumbnail + "&loaded";
    var thumbnailSize = { width: 280, height: 200 };
    
    var anchor = $("<a />", {
      href: this.url,
      target: "_blank",
      className: "fetching"
    });
    
    var img;
    
    var renderImage = function(screenShotUrl) {
      if (!img) {
        img = $("<img />").appendTo(anchor);
      }
      img.attr("src", protonet.media.Proxy.getImageUrl(screenShotUrl, thumbnailSize));
    };
    
    var renderAndObserveImage = function() {
      renderImage(thumbnailReady);
      anchor.removeClass("fetching");
      new protonet.effects.HoverResize(img, thumbnailSize);
    };
    
    protonet.media.Proxy.isImageAvailable(thumbnailReady, function(status) {
      if (status) {
        return renderAndObserveImage();
      }
      
      renderImage(thumbnail);
      protonet.media.ScreenShot.fetch(this.url, null, {
        success: function() {
          renderAndObserveImage();
        },
        failure: function() {
          anchor.removeClass("fetching");
        }
      });
    }.bind(this));
    
    return anchor;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};