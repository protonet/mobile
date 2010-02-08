//= require "../../../data/twitpic.js"

/**
 * Twitpic Provider
 */
protonet.controls.TextExtension.providers.Twitpic = function(url) {
  this.url = url;
  this.data = {
    type: "Twitpic",
    url: this.url
  };
  
  /**
   * Matches
   * http://twitpic.com/d1x47
   * http://twitpic.com/d1x47#
   * http://twitpic.com/d1x47/full
   */
  this._regExp = /twitpic\.com\/(\w{5,7}?)$|#$|\/full$/i;
};

protonet.controls.TextExtension.providers.Twitpic.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },

  _extractId: function() {
    return this.url.match(this._regExp)[1];
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    var yqlCallback = this._yqlCallback.bind(this, onSuccessCallback, onEmptyResultCallback, onErrorCallback);
    
    new protonet.data.YQL.Query(
      "SELECT content,p FROM html WHERE " + 
        "url='" + this.url + "' AND (xpath='//title' OR xpath='//div[@id=\"view-photo-caption\"]')"
    ).execute(
      yqlCallback, yqlCallback
    );
  },
  
  _yqlCallback: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var results = response && response.query && response.query.results;
    
    if (!results) {
      return onEmptyResultCallback(response);
    }
    
    $.extend(this.data, {
      description:  (results.div && results.div.p) || "",
      title:        results.title
    });
    
    onSuccessCallback(this.data);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  getDescription: function() {
    return this.data.description;
  },
  
  getTitle: function() {
    return this.data.title;
  },
  
  getMedia: function() {
    var anchor = $("<a />", {
        href: this.url,
        target: "_blank"
      }),
      img = $("<img />", {
        src: protonet.data.TwitPic.getPhotoUrl(this._extractId()),
        width: 75,
        height: 75
      });
    
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};