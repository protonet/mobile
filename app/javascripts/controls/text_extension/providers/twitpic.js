//= require "../../../data/twitpic.js"

/**
 * Twitpic Provider
 */
protonet.controls.TextExtension.providers.Twitpic = function(url) {
  this.url = url;
  this.data = {
    type: "Twitpic",
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Twitpic.prototype = {
  /**
   * Matches
   * http://twitpic.com/d1x47
   * http://twitpic.com/d1x47#
   * http://twitpic.com/d1x47/full
   */
  REG_EXP: /twitpic\.com\/(\w{5,7}?)$|#$|\/full$/i,
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },

  _extractId: function() {
    return this.url.match(this.REG_EXP)[1];
  },
  
  loadData: function(onSuccessCallback, onFailureCallback) {
    var yqlCallback = this._yqlCallback.bind(this, onSuccessCallback);
    
    new protonet.data.YQL.Query(
      "SELECT content,p FROM html WHERE " + 
        "url='" + this.url + "' AND xpath IN ('//title', '//div[@id=\"view-photo-caption\"]')"
    ).execute(
      yqlCallback, onFailureCallback
    );
  },
  
  _yqlCallback: function(onSuccessCallback, response) {
    if (this._canceled) {
      return;
    }
    
    $.extend(this.data, {
      description:  (response.div && response.div.p) || "",
      title:        response.title
    });
    
    onSuccessCallback(this.data);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  getDescription: function() {
    return this.data.description;
  },
  
  getTitle: function() {
    return this.data.title;
  },
  
  getMedia: function() {
    var anchor = $("<a />", {
        href: this.url,
        target: "_blank"
      }),
      img = $("<img />", {
        src: protonet.data.TwitPic.getPhotoUrl(this._extractId()),
        width: 75,
        height: 75
      });
    
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};