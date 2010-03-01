//= require "../../../data/vimeo.js"
//= require "../../../utils/format_seconds.js"
//= require "../../../utils/strip_tags.js"

/**
 * YouTube Provider
 */
protonet.controls.TextExtension.providers.Vimeo = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Vimeo.prototype = {
  REG_EXP: /vimeo\.com\/(\d+)/i,
  CLASS_NAME: "flash-video",
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this.REG_EXP)[1];
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    protonet.data.Vimeo.getVideo(
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
    
    $.extend(this.data, {
      description:  protonet.utils.stripTags(response.description),
      duration:     response.duration,
      thumbnail:    response.thumbnail_small,
      title:        response.title,
      tags:         response.tags
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
      "http://vimeo.com/moogaloop.swf?clip_id=" + this._extractId() + "&server=vimeo.com&show_title=1&show_byline=1&show_portrait=0&color=&fullscreen=1&autoplay=1",
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
          src: thumbnail,
          height: 75,
          width: 100
        });
    anchor.click(this._showVideo.bind(this));
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};

