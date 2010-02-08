//= require "../../../data/youtube.js"
//= require "../../../utils/format_seconds.js"

/**
 * YouTube Provider
 */
protonet.controls.TextExtension.providers.YouTube = function(url) {
  this.id = new Date().getTime() + Math.round(Math.random() * 1000);
  this.url = url;
  this._regExp = /youtube\.com\/watch\?v\=([\w_-]*)/i;
};

protonet.controls.TextExtension.providers.YouTube.prototype = {
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
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, onEmptyResultCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var entry = response.entry;
    if (!entry) {
      return onEmptyResultCallback(response);
    }
    
    this.data = {
      description:  entry["media$group"]["media$description"]["$t"],
      duration:     entry["media$group"]["yt$duration"].seconds, 
      thumbnail:    entry["media$group"]["media$thumbnail"][0],
      noembed:      !!entry["yt$noembed"],
      tags:         entry["media$group"]["media$keywords"]["$t"], 
      title:        entry["media$group"]["media$title"]["$t"],
      type:         "YouTube",
      url:          this.url
    };
    
    onSuccessCallback(this.data);
  },
  
  _onError: function(onErrorCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onErrorCallback(response);
  },
  
  _showVideo: function(event) {
    if (this.data.noembed) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    var placeholderId = "text-extension-media-" + this.id;
    $(event.target).attr("id", placeholderId);
    $.getScript("http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", function() {
      var params = {
        allowfullscreen: true,
        wmode: "opaque"
      };
      
      swfobject.embedSWF(
        "http://www.youtube.com/v/" + this._extractId() + "?playerapiid=ytplayer&autoplay=1&egm=0&hd=1&showinfo=0&rel=0",
        placeholderId,
        "auto", "auto", "8",
        null, {}, params
      );
    }.bind(this));
  },
  
  getDescription: function() {
    var description = this.data.description;
    description = description || this.url;
    return String(description).truncate(200);
  },
  
  getTitle: function() {
    var seconds = protonet.utils.formatSeconds(this.data.duration),
        title = String(this.data.title).truncate(70) + " (" + seconds + ")";
    return title;
  },
  
  getMedia: function() {
    var thumbnail = this.data.thumbnail,
        anchor = $("<a />", {
          href: this.url,
          target: "_blank"
        }),
        img = $("<img />", {
          src: thumbnail.url,
          height: thumbnail.height,
          width: thumbnail.width
        });
    anchor.click(this._showVideo.bind(this));
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

