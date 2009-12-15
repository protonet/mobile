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
    new protonet.data.YQL.Query(
      "SELECT * FROM html WHERE " + 
        "url='" + this.url + "' AND (xpath = '//meta[@name=\"description\"]' OR xpath='//title')"
    ).execute(
      this._onSuccess.bind(this, onSuccessCallback, onEmptyResultCallback),
      this._onError.bind(this, onErrorCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, onEmptyResultCallback, response) {
    console.log("YQL diagnostics: ", response.query.diagnostics);
    
    var results = response.query.results;
    if (!results) {
      return onEmptyResultCallback(response);
    }
    
    this.data = {
      description:  results.meta && results.meta.content,
      title:        $.isArray(results.title) ? $.trim(results.title.join(" ")) : results.title,
      type:         "Link",
      url:          this.url,
      thumbnail:    protonet.media.getScreenShot(this.url, "T")
    };
    
    onSuccessCallback(this.data);
  },
  
  _onError: function(onErrorCallback, response) {
    console.log("YQL Timeout.");
    
    onErrorCallback(response);
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
    var thumbnail = this.data.thumbnail;
    return $("<img />").attr({
      src: thumbnail,
      height: 70,
      width: 90
    });
  },
  
  getMediaCallback: function() {
    return function() {};
  }
};