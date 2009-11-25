/**
 * YouTube Provider
 */
protonet.controls.TextExtension.YouTube = function(url, parent) {
  this.url = url;
  this.parent = parent;
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
  
  _showVideo: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    $(event.target).attr("id", "text-extension-media");
    $.getScript("http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", function() {
      swfobject.embedSWF(
        "http://www.youtube.com/v/" + this._extractId() + "?&playerapiid=ytplayer&autoplay=1&egm=0&hd=1&showinfo=0&rel=0",
        "text-extension-media",
        "590", "356", "8"
      );
      this.parent.container.css("height", "auto");
    }.bind(this));

  },
  
  getDescription: function() {
    var description = this.data["media$group"]["media$description"]["$t"];
    description = description || this.url;
    return String(description).truncate(75);
  },
  
  getTitle: function() {
    var mediaGroup = this.data["media$group"],
        seconds = protonet.utils.formatSeconds(mediaGroup["yt$duration"].seconds),
        title = String(mediaGroup["media$title"]["$t"]).truncate(70) + " <span>(" + seconds + ")</span>";
    return title;
  },
  
  getMedia: function() {
    var thumbnail = this.data["media$group"]["media$thumbnail"][0],
        img = $("<img />");
    img.bind("click", this._showVideo.bind(this));
    img.attr({
      src: thumbnail.url,
      height: thumbnail.height,
      width: thumbnail.width
    });
    return img;
  },
  
  getType: function() {
    return "YouTube Video";
  },
  
  getClassName: function() {
    return "yt";
  },
  
  getLink: function() {
    return this.url;
  },
  
  getMediaLink: function() {
    return this._showVideo.bind(this);
  }
};