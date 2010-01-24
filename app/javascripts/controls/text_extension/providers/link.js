//= require "../../../data/yql.js"
//= require "../../../media/get_screenshot.js"

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
        "url='" + this.url + "' AND (xpath = '//meta[@name=\"description\"]' OR xpath='//title')"
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
      title:        String(results.title || this.url.replace(/http.*?\:\/\/(www.)?/i, "")),
      type:         "Link",
      url:          this.url,
      thumbnail:    protonet.media.getScreenShot(this.url, "T")
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
          height: 70,
          width: 97
        });
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};