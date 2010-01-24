//= require "../../../data/vimeo.js"
//= require "../../../utils/format_seconds.js"
//= require "../../../utils/strip_tags.js"

/**
 * YouTube Provider
 */
protonet.controls.TextExtension.providers.Vimeo = function(url) {
  this.id = new Date().getTime() + Math.round(Math.random() * 1000);
  this.url = url;
  this.data = {};
  this._regExp = /vimeo\.com\/(\d+)/i;
};

protonet.controls.TextExtension.providers.Vimeo.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this._regExp)[1];
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    protonet.data.Vimeo.getVideo(
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
    var entry = response[0];
    if (!entry) {
      return onEmptyResultCallback(response);
    }
    
    this.data = {
      description:  protonet.utils.stripTags(entry.description),
      duration:     entry.duration, 
      thumbnail:    entry.thumbnail_small,
      title:        entry.title,
      type:         "Vimeo",
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
      swfobject.embedSWF(
        "http://vimeo.com/moogaloop.swf?clip_id=" + this._extractId() + "&server=vimeo.com&show_title=1&fullscreen=1",
        placeholderId,
        "auto", "auto", "8"
      );
    }.bind(this));
  },
  
  getDescription: function() {
    var description = this.data.description;
    description = description || this.url;
    return String(description).truncate(75);
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

