/**
 * Google Maps Provider
 */
protonet.controls.TextExtension.providers.Maps = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.Maps.prototype = {
  /**
   * Matches
   * http://maps.google.de/?ie=UTF8&ll=37.0625,-95.677068&spn=31.977057,79.013672&z=4
   * http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=hamburg&sll=37.0625,-95.677068&sspn=31.977057,79.013672&ie=UTF8&hq=&hnear=Hamburg,+Germany&z=10
   */
  REG_EXP: /maps\.google\.[\w.]{2,5}\/(maps)*\?/i,
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  _extractQuery: function() {
    var match = this.url.match(/&q=(.*?)&/i);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },
  
  _extractHNear: function() {
    var match = this.url.match(/&hnear=(.*?)&/i);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },
  
  loadData: function(onSuccessCallback) {
    var near = this._extractHNear(),
        query = this._extractQuery();
    $.extend(this.data, {
      description:  near && query,
      title:        near || query
    });
    onSuccessCallback(this.data);
  },
  
  setData: function(data) {
    this.data = data;
  },
  
  getDescription: function() {
    return this.data.description || "";
  },
  
  getTitle: function() {
    return this.data.title || "";
  },
  
  getMedia: function() {
    var url = this.url,
        isStreetView = url.indexOf("&cbp=") != -1;
    if (isStreetView) {
      url += "&output=svembed";
    } else {
      url += "&output=embed";
    }
    
    return $("<iframe />", { src: url });
  },
  
  cancel: function() {
    this._canceled = true;
  }
};