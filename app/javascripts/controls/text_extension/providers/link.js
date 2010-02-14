//= require "../../../data/yql.js"
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
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    var yqlSearchTableCallback = this._yqlSearchTableCallback.bind(this, onSuccessCallback),
        yqlHtmlTableCallback = this._yqlHtmlTableCallback.bind(this, onSuccessCallback),
        yqlTimeoutCallback = this._yqlTimeoutCallback.bind(this, onSuccessCallback),
        urlParts = protonet.utils.parseUrl(this.url);
    
    this._shortUrl = urlParts.host + urlParts.port + urlParts.path + urlParts.query;
    
    new protonet.data.YQL.Query(
      "SELECT title, abstract FROM search.web WHERE " + 
        "query='" + this._shortUrl + "' AND sites='" + urlParts.host + "' LIMIT 1"
    ).execute(
      yqlSearchTableCallback,
      yqlSearchTableCallback
    );
    
    new protonet.data.YQL.Query(
      "SELECT content FROM html WHERE " + 
        "url='" + this.url + "' AND (xpath='//meta[@name=\"description\"]' OR xpath='//meta[@name=\"keywords\"]' OR xpath='//title')"
    ).execute(
      yqlHtmlTableCallback,
      yqlHtmlTableCallback
    );
    
    setTimeout(yqlTimeoutCallback, 6000);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _yqlHtmlTableCallback: function(onSuccessCallback, response) {
    if (this._canceled || this._yqlFinished) {
      return;
    }
    
    var results = (response &&
                   response.query &&
                   response.query.results);
    
    if (!results) {
      return;
    }
    
    this._yqlFinished = true;
    
    $.extend(this.data, {
      description:  results.meta && results.meta[0] && results.meta[0].content,
      tags:         results.meta && results.meta[1] && results.meta[1].content,
      title:        String(results.title || this._shortUrl).replace(/^,+/, "").replace(/,+$/, ""),
      thumbnail:    protonet.media.ScreenShot.get(this.url)
    });
    
    onSuccessCallback(this.data);
  },
  
  _yqlSearchTableCallback: function(onSuccessCallback, response) {
    if (this._canceled || this._yqlFinished) {
      return;
    }
    
    var result = (response &&
                  response.query &&
                  response.query.results &&
                  response.query.results.result);    
    
    if (!result) {
      return;
    }
    
    this._yqlFinished = true;
    
    $.extend(this.data, {
      description:  protonet.utils.stripTags(result["abstract"] || ""),
      title:        protonet.utils.stripTags(result.title || this._shortUrl),
      thumbnail:    protonet.media.ScreenShot.get(this.url)
    });
    
    onSuccessCallback(this.data);
  },
  
  _yqlTimeoutCallback: function(onSuccessCallback) {
    if (this._canceled || this._yqlFinished) {
      return;
    }
    
    this._yqlFinished = true;
    
    $.extend(this.data, {
      description:  "",
      title:        this._shortUrl,
      thumbnail:    protonet.media.ScreenShot.get(this.url)
    });
    
    onSuccessCallback(this.data);
  },
  
  getDescription: function() {
    var description = this.data.description;
    description = description;
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
              new protonet.effects.HoverResize(img, { width: 280, height: 202 });
            } else {
              this.timeout = setTimeout(checkAvailibility, 6000);
            }
          }.bind(this));
        }.bind(this);
    
    checkAvailibility();
    
    return anchor.append(img);
  },
  
  cancel: function() {
    clearTimeout(this.timeout);
    this._canceled = true;
  }
};