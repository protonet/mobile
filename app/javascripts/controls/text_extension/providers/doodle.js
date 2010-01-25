/**
 * Doodle Provider
 */
protonet.controls.TextExtension.providers.Doodle = function(url) {
  this.url = url;
  
  /**
   * Matches
   * http://www.doodle.com/participation.html?pollId=w6azsxu3bmdw6zsw
   * http://www.doodle.com/embedPoll.html?pollId=w6azsxu3bmdw6zsw
   * http://www.doodle.com/w6azsxu3bmdw6zsw
   */
  this._regExp = /doodle\.com\/(participation\.html\?pollId\=)*([\w]+?$)/i;
};

protonet.controls.TextExtension.providers.Doodle.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },

  _extractId: function() {
    return this.url.match(this._regExp)[2];
  },
  
  loadData: function(onSuccessCallback) {
    this.data = {
      description:  "",
      title:        "",
      type:         "Doodle",
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
    var interval,
        url = "http://www.doodle.com/summary.html?pollId=" + this._extractId(),
        iframe = $("<iframe />", { src: url });
    
    interval = setInterval(function() {
      iframe.is(":visible") ? iframe.attr("src", url) : clearInterval(interval);
    }, 60000);
    
    return iframe;
  },
  
  cancel: function() {
    this._canceled = true;
  }
};