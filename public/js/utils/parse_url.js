protonet.utils.parseUrl = (function() {
  var anchor = document.createElement("a"),
      PATH_REGEXP = /^([^\/])/,
      PORT_REGEXP = /\:(80|443)$/,
      FILENAME_REGEXP = /\/([^\/?#]+)$/i;
      
  return function(url) {
    anchor.href = url;
    
    var host = anchor.host.replace(PORT_REGEXP, "");
    
    return {
      protocol:   anchor.protocol,
      host:       host,
      port:       anchor.port,
      query:      anchor.search,
      path:       anchor.pathname.replace(PATH_REGEXP, "/$1"),
      hash:       anchor.hash.replace("#", ""),
      filename:   decodeURIComponent((anchor.pathname.match(FILENAME_REGEXP) || [,""])[1])
    };
  };
})();