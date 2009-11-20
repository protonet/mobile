/**
 * WebLink Provider
 */
protonet.controls.TextExtension.WebLink = function(url) {
  this.url = url;
};

protonet.controls.TextExtension.WebLink.prototype = {
  match: function() {
    return !!this.url;
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    new protonet.data.YQL.Query(
      "SELECT * FROM html WHERE " + 
        "url='" + this.url + "' AND (xpath = '//meta[@name=\"description\"]' OR xpath='//title' OR xpath='//img')"
    ).execute(
      this._onSuccess.bind(this, onSuccessCallback, onEmptyResultCallback),
      this._onError.bind(this, onErrorCallback)
    );
  },
  
  _onSuccess: function(onSuccessCallback, onEmptyResultCallback, response) {
    this.data = response.query.results;
    if (this.data) {
      onSuccessCallback(response);
    } else {
      onEmptyResultCallback(response);
    }
  },
  
  _onError: function(onErrorCallback, response) {
    onErrorCallback(response);
  },
  
  getDescription: function() {
    var description = this.data.meta && this.data.meta.content;
    description = description || this.url;
    return String(description);
  },
  
  getTitle: function() {
    var title = this.data.title;
    if ($.isArray(title)) {
      title = $.trim(title.join(" "));
    }
    return String(title);
  },
  
  getMedia: function() {
    return $('<img />').attr({
      src: protonet.media.getScreenShot(this.url, "T"),
      height: 70,
      width: 90
    });
  },
  
  getType: function() {
    return "Link";
  },
  
  getClassName: function() {
    return "web-link";
  }
};