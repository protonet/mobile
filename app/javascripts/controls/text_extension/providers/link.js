//= require "../../../data/yql.js"
//= require "../../../media/screenshot.js"

/**
 * WebLink Provider
 */
protonet.controls.TextExtension.providers.Link = function(url) {
  this.url = url;
};

protonet.controls.TextExtension.providers.Link.prototype = {
  match: function() {
    return !!this.url;
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    var yqlCallback = this._yqlCallback.bind(this, onSuccessCallback);
    
    new protonet.data.YQL.Query(
      "SELECT content FROM html WHERE " + 
        "url='" + this.url + "' AND (xpath='//meta[@name=\"description\"]' OR xpath='//meta[@name=\"keywords\"]' OR xpath='//title')"
    ).execute(
      yqlCallback, yqlCallback
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _yqlCallback: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var results = (response && response.query && response.query.results) || {};
    
    this.data = {
      description:  results.meta && results.meta[0] && results.meta[0].content,
      tags:         results.meta && results.meta[1] && results.meta[1].content,
      title:        String(results.title || this.url.replace(/http.*?\:\/\/(www.)?/i, "")),
      type:         "Link",
      url:          this.url,
      thumbnail:    protonet.media.ScreenShot.get(this.url)
    };
    
    onSuccessCallback(this.data);
  },
  
  getDescription: function() {
    var description = this.data.description;
    description = description || this.url;
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
        img = $("<img />", {
          src: thumbnail
        }),
        checks = 0,
        checkAvailibility = function() {
          protonet.media.ScreenShot.isAvailable(this.url, undefined, function(isAvailable) {
            if (isAvailable || ++checks > 10) {
              anchor.removeClass("fetching");
              img.attr("src", img.attr("src") + "&cachebuster=" + new Date().getTime());
              clearInterval(this.interval);
            }
          }.bind(this));
        }.bind(this),
        hoverTimeout;
    
    
    img.hover(function() {
      if (anchor.hasClass("fetching")) {
        return;
      }
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(function() {
        img.stop().animate({
          width: "280px",
          height: "202px"
        }, "fast");
      }, 400);
    }, function() {
      if (anchor.hasClass("fetching")) {
        return;
      }
      
      clearTimeout(hoverTimeout);
      img.stop().animate({
        width: "97px",
        height: "70px"
      }, "fast");
    });
    
    checkAvailibility();
    this.interval = setInterval(checkAvailibility, 6000);
    
    return anchor.append(img);
  },
  
  cancel: function() {
    clearInterval(this.interval);
    this._canceled = true;
  }
};