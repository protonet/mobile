//= require "../../../data/yql.js"

/**
 * XING Profile Provider
 */
protonet.controls.TextExtension.providers.GIST = function(url) {
  this.url = url;
  // http://gist.github.com/286785
  this._regExp = /gist\.github\.com\/([0-9]*)/i;
};

protonet.controls.TextExtension.providers.GIST.prototype = {
  match: function() {
    return this._regExp.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this._regExp)[1];
  },
  
  loadData: function(onSuccessCallback, onEmptyResultCallback, onErrorCallback) {
    // debugger;
    this.data = {
      description:  "",
      title:        "",
      type:         "GIST",
      url:          this.url
    };
    onSuccessCallback(this.data);
  },
  
  setData: function(data) {
    // debugger;
    this.data = data;
  },
    
  getDescription: function() {
    return "";
  },
  
  getTitle: function() {
    return "";
  },
  
  getMedia: function() {
    // 286785
    // http://gist.github.com/286785.js
    // return $("<script src=\"http://gist.github.com/" + this._extractId() + ".js\"></script>");
    // jQuery.getScript("http://gist.github.com/" + this._extractId() + ".js");
    return $("<iframe />", {
      src: "javascript:'document.write(\"<html>" + "<script src=\"http://gist.github.com/" + this._extractId() + ".js\"></script>" + "</html>'\");"
    });
  },
  
  cancel: function() {
    this._canceled = true;
  }
};