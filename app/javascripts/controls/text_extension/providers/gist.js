//= require "../../../data/yql.js"

/**
 * XING Profile Provider
 */
protonet.controls.TextExtension.providers.GIST = function(url) {
  this.url = url;
  this.data = {
    url: this.url
  };
};

protonet.controls.TextExtension.providers.GIST.prototype = {
  /**
   * Matches:
   * http://gist.github.com/286785
   */
  REG_EXP: /gist\.github\.com\/([0-9]*)/i,
  
  match: function() {
    return this.REG_EXP.test(this.url);
  },
  
  _extractId: function() {
    return this.url.match(this.REG_EXP)[1];
  },
  
  loadData: function(onSuccessCallback) {
    // debugger;
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