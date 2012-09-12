protonet.utils.convertToAbsoluteUrl = (function() {
  var PROTOCOL_REG_EXP = /^(ftp|https?):\/\/.+/i,
      PROTOCOL_RELATIVE_REG_EXP = /^\/{2}[^\/]/i,
      DOMAIN_RELATIVE_REG_EXP = /^\/{1}[^\/]/i;
      
  return function(relativeUrl, parentUrl) {
    // Already absolute, bye
    if (PROTOCOL_REG_EXP.test(relativeUrl)) {
      return relativeUrl;
    }
    
    var parentUrlParts = parentUrl ? protonet.utils.parseUrl(parentUrl) : protonet.utils.parseUrl(protonet.config.api_url);
    
    // Protocol-relative (eg. "//google.com/img/foo.jpg")
    if (PROTOCOL_RELATIVE_REG_EXP.test(relativeUrl)) {
      return parentUrlParts.protocol + relativeUrl;
    }
    
    // Domain-relative (eg. "/img/foo.jpg")
    if (DOMAIN_RELATIVE_REG_EXP.test(relativeUrl)) {
      return parentUrlParts.protocol + "//" + parentUrlParts.host + relativeUrl;
    }
    
    var path = parentUrlParts.path || parentUrlParts.pathname;
    // Folder-relative (eg. "foo.jpg" or "../foo.jpg")
    return parentUrlParts.protocol + "//" +
           parentUrlParts.host +
           path.substring(0, path.lastIndexOf("/")) + "/" +
           relativeUrl;
  };
})();