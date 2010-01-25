//= require "../../../data/yql.js"

/**
 * XING Profile Provider
 */
protonet.controls.TextExtension.providers.XING = function(url) {
  this.url = url;
  this._regExp = /xing\.com\/profile\/(.+?)[^\?]/i;
};

protonet.controls.TextExtension.providers.XING.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },
  
  
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    var yqlCallback = this._yqlCallback.bind(this, onSuccessCallback);
    
    new protonet.data.YQL.Query(
      "SELECT content, src FROM html WHERE " + 
        "url='" + this.url + "' AND (xpath='//meta[@name=\"description\"]' OR xpath='//title' OR xpath='//img[@id=\"photo\"]')"
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
      description:  results.meta && results.meta.content,
      title:        String(results.title),
      type:         "XING",
      url:          this.url,
      thumbnail:    "http://www.xing.com" + (results.img && results.img.src.replace(".jpg", "_s3.jpg") || "/img/users/nobody_m_s3.gif")
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
          target: "_blank"
        }),
        img = $("<img />", {
          src: thumbnail,
          height: 93,
          width: 70
        });
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};