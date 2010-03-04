//= require "../../../data/yql.js"

/**
 * XING Profile Provider
 */
protonet.controls.TextExtension.providers.XING = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.XING.prototype = {
  /**
   * Matches
   * https://www.xing.com/profile/Christopher_Blum2
   */
  REG_EXP: /xing\.com\/profile\/(.+?)[^\?]/i,
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  loadData: function(onSuccessCallback) {
    var yqlCallback = this._yqlCallback.bind(this, onSuccessCallback);
    
    new protonet.data.YQL.Query(
      "SELECT content, src FROM html WHERE url='" + this.url + "' AND xpath IN ('"+
          "//meta[@name=\"description\"]'," +
          "'//title'," +
          "'//meta[@name=\"keywords\"]'," +
          "'//img[@id=\"photo\"]'" +
      ")"
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
    
    var meta = response.meta,
        img = response.img;
    
    $.extend(this.data, {
      description:  (meta && meta[0] && meta[0].content) || "",
      tags:         (meta && meta[1] && meta[1].content) || "",
      title:        String(response.title || ""),
      thumbnail:    "http://www.xing.com" + (img && img.src.replace(/(\,\d)*?\.jpg/, "_s3.jpg") || "/img/users/nobody_m_s3.gif")
    });
    
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
    var thumbnailSize = {
      width: protonet.controls.TextExtension.config.IMAGE_WIDTH,
      height: 90
    };
    var thumbnail = protonet.media.Proxy.getImageUrl(this.data.thumbnail, thumbnailSize);
    
    var anchor = $("<a />", {
      href: this.url,
      target: "_blank"
    });
    
    var img = $("<img />", $.extend({
      src: thumbnail
    }, thumbnailSize));
    
    return anchor.append(img);
  },
  
  cancel: function() {
    this._canceled = true;
  }
};