protonet.utils.Sandbox = (function() {
  function _createIframe() {
    return $("<iframe>", {
      width:              1,
      height:             1,
      frameborder:        0,
      marginheight:       0,
      marginwidth:        0,
      allowtransparency:  "true"
    }).css({
      position: "absolute"
    });
  }
  
  var Sandbox = function() {
    this.iframe = _createIframe();
    return this;
  };
  
  Sandbox.prototype = {
    appendTo: function(element) {
      this.iframe.appendTo(element);
      return this;
    },
    
    load: function(callback) {
      this.iframe.one("load", function() {
        callback(this.contentWindow);
      });
      return this;
    }
  };
  
  return Sandbox;
})();