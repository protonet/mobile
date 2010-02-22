//= require "../../../data/yql.js"
//= require "../../../data/google.js"
//= require "../../../media/screenshot.js"
//= require "../../../effects/hover_resize.js"
//= require "../../../utils/parse_url.js"
//= require "../../../utils/strip_tags.js"


/**
 * WebLink Provider
 */
protonet.controls.TextExtension.providers.Link = function(url) {
  this.url = url;
  this.data = {
    type: "Link",
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Link.prototype = {
  match: function() {
    return !!this.url;
  },
  
  loadData: function(onSuccessCallback) {
    // preload screenshot
    this.data.thumbnail = new Image().src = protonet.media.ScreenShot.get(this.url);
    
    protonet.data.Google.search(
      this.url,
      this._googleSearchCallback.bind(this, onSuccessCallback),
      this._googleSearchFailureCallback.bind(this, onSuccessCallback)
    );
  },
  
  _googleSearchCallback: function(onSuccessCallback, response) {
    var result = response[0];
    $.extend(this.data, {
      description:  protonet.utils.stripTags(result.content),
      title:        protonet.utils.stripTags(result.title)
    });
    
    onSuccessCallback(this.data);
  },
  
  _googleSearchFailureCallback: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    // Ok google, doesn't know anything about the given url, so we try to get our own data using YQL html lookup
    new protonet.data.YQL.Query(
      "SELECT content FROM html WHERE " + 
      "url='" + this.url + "' AND (xpath='//meta[@name=\"description\"]' OR xpath='//meta[@name=\"keywords\"]' OR xpath='//title')"
    ).execute(
      this._yqlCallback.bind(this, onSuccessCallback),
      this._yqlCallback.bind(this, onSuccessCallback)
    );
  },
  
  _yqlCallback: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var urlParts = protonet.utils.parseUrl(this.url),
        shortUrl = urlParts.host + urlParts.path + urlParts.query,
        meta = response.meta;
    
    $.extend(this.data, {
      description:  (meta && meta[0] && meta[0].content) || "",
      tags:         (meta && meta[1] && meta[1].content) || "",
      title:        String(response.title || shortUrl).replace(/^,+/, "").replace(/,+$/, "")
    });
    
    onSuccessCallback(this.data);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  getDescription: function() {
    var description = this.data.description || "";
    return String(description).truncate(200);
  },
  
  getTitle: function() {
    var title = this.data.title;
    return String(title).truncate(75);
  },
  
  getMedia: function() {
    var thumbnail = this.data.thumbnail,
        anchor = $("<a />", {
          href: this.url,
          target: "_blank",
          className: "fetching"
        }),
        img,
        checks = 0,
        // Check every 4 seconds if screenshot is available
        checkAvailibility = function() {
          protonet.media.ScreenShot.isAvailable(this.url, null, function(isAvailable) {
            if (checks == 0) {
              img = $("<img />", { src: thumbnail  }).appendTo(anchor);
            }
            
            if (checks > 0 && isAvailable) {
              img.attr("src", thumbnail + "&loaded");
            }
            
            if (checks > 8 || isAvailable) {
             anchor.removeClass("fetching"); 
             new protonet.effects.HoverResize(img, { width: 280, height: 202 });
            } else {
              checks++;
              this.timeout = setTimeout(checkAvailibility, 4000);
            }
          }.bind(this));
        }.bind(this);
    
    checkAvailibility();
    
    return anchor;
  },
  
  cancel: function() {
    clearTimeout(this.timeout);
    this._canceled = true;
  }
};