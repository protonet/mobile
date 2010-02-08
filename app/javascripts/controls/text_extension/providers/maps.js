/**
 * Google Maps Provider
 */
protonet.controls.TextExtension.providers.Maps = function(url) {
  this.url = url;
  this.data = {
    type: "Maps",
    url: this.url
  };
  
  /**
   * Matches
   * http://maps.google.de/?ie=UTF8&ll=37.0625,-95.677068&spn=31.977057,79.013672&z=4
   * http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=hamburg&sll=37.0625,-95.677068&sspn=31.977057,79.013672&ie=UTF8&hq=&hnear=Hamburg,+Germany&z=10
   */
  this._regExp = /maps\.google\.[\w.]{2,5}\/(maps)*\?/i;
};

protonet.controls.TextExtension.providers.Maps.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },
  
  _extractQuery: function() {
    var match = this.url.match(/&q=(.+?)&/i);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },
  
  _extractHNear: function() {
    var match = this.url.match(/&hnear=(.+?)&/i);
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  },
  
  loadData: function(onSuccessCallback) {
    $.extend(this.data, {
      description:  this._extractHNear() || "",
      title:        this._extractQuery() || ""
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
    var url = this.url + "&output=embed",
        iframe = $("<iframe />", { src: url });
    
    return iframe;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};