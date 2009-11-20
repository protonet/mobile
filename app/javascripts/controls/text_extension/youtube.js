/**
 * YouTube Provider
 */
protonet.controls.TextExtension.YouTube = function(url) {
  this.url = url;
  this._regExp = /youtube.com\/watch\?v\=([\w_-]*)/i;
};

protonet.controls.TextExtension.YouTube.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this._regExp)[1];
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    protonet.data.YouTube.getVideo(
      this._extractId(),
      this._onSuccess.bind(this, onSuccessCallback, onEmptyResultCallback),
      this._onError.bind(this, onErrorCallback)
    );
  },
  
  _onSuccess: function(onSuccessCallback, onEmptyResultCallback, response) {
    this.data = response.entry;
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
    var description = this.data["media$group"]["media$description"]["$t"];
    description = description || this.url;
    return description;
  },
  
  getTitle: function() {
    var mediaGroup = this.data["media$group"],
        seconds = protonet.utils.formatSeconds(mediaGroup["yt$duration"].seconds),
        title = mediaGroup["media$title"]["$t"] + " <span>(" + seconds + ")</span>";
    return title;
  },
  
  getMedia: function() {
    var thumbnail = this.data["media$group"]["media$thumbnail"][0];
    return $('<img />').attr({
      src: thumbnail.url,
      height: thumbnail.height,
      width: thumbnail.width
    });
  },
  
  getType: function() {
    return "YouTube Video";
  },
  
  getClassName: function() {
    return "yt";
  }
};