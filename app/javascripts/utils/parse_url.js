protonet.utils.parseUrl = (function() {
  var anchor = document.createElement("a"),
      PATH_REGEXP = /^([^\/])/,
      FILENAME_REGEXP = /\/([^\/?#]+)$/i;
      
  return function(url) {
    anchor.href = url;
    return {
      protocol:   anchor.protocol.replace(":", ""),
      host:       anchor.hostname,
      port:       anchor.port,
      query:      anchor.search,
      path:       anchor.pathname.replace(PATH_REGEXP, "/$1"),
      hash:       anchor.hash.replace("#", ""),
      filename:   (anchor.pathname.match(FILENAME_REGEXP) || [,""])[1]
    };
  };
})();