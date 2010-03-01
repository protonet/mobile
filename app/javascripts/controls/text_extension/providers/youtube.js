//= require "../../../data/youtube.js"
//= require "../../../utils/format_seconds.js"

/**
 * YouTube Provider
 */
protonet.controls.TextExtension.providers.YouTube = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.YouTube.prototype = {
  REG_EXP: /youtube\.com\/watch\?v\=([\w_-]*)/i,
  CLASS_NAME: "flash-video",
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this.REG_EXP)[1];
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    protonet.data.YouTube.getVideo(
      this._extractId(),
      this._onSuccess.bind(this, onSuccessCallback, onFailureCallback),
      this._onFailure.bind(this, onFailureCallback)
    );
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  _onSuccess: function(onSuccessCallback, onFailureCallback, response) {
    if (this._canceled) {
      return;
    }
    
    var mediaGroup = response["media$group"];
    
    $.extend(this.data, {
      description:  mediaGroup["media$description"]["$t"],
      duration:     mediaGroup["yt$duration"].seconds, 
      thumbnail:    mediaGroup["media$thumbnail"][0],
      noembed:      !!response["yt$noembed"],
      tags:         mediaGroup["media$keywords"]["$t"], 
      title:        mediaGroup["media$title"]["$t"]
    });
    
    onSuccessCallback(this.data);
  },
  
  _onFailure: function(onFailureCallback, response) {
    if (this._canceled) {
      return;
    }
    
    onFailureCallback(response);
  },
  
  _showVideo: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var params = {
      allowfullscreen: true,
      wmode: "opaque"
    };
    
    swfobject.embedSWF(
      "http://www.youtube.com/v/" + this._extractId() + "?playerapiid=ytplayer&autoplay=1&egm=0&hd=1&showinfo=0&rel=0",
      this.id,
      "auto", "auto", "8",
      null, {}, params
    );
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
    this.id = "text-extension-preview-" + new Date().getTime() + Math.round(Math.random() * 1000);
    var thumbnail = this.data.thumbnail,
        anchor = $("<a />", {
          href: this.url,
          target: "_blank",
          id: this.id
        }),
        img = $("<img />", {
          src: thumbnail.url,
          height: thumbnail.height,
          width: thumbnail.width
        });
    
    if (!this.data.noembed) {
      anchor.click(this._showVideo.bind(this));
    }
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

