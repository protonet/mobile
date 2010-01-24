/**
 * Google Maps Provider
 */
protonet.controls.TextExtension.providers.Maps = function(url) {
  this.url = url;
  
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
    return match && match[1];
  },
  
  loadData: function(onSuccessCallback) {
    this.data = {
      description:  "",
      title:        this._extractQuery() || "",
      type:         "Maps",
      url:          this.url
    };
    
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