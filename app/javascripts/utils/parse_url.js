protonet.utils.parseUrl = (function() {
  var anchor = document.createElement("a");
  
  return function(url) {
    anchor.href = url;
    return {
      protocol:   anchor.protocol.replace(":", ""),
      host:       anchor.hostname,
      port:       anchor.port,
      query:      anchor.search,
      path:       anchor.pathname.replace(/^([^\/])/, "/$1"),
      hash:       anchor.hash.replace("#", "")
    };
  };
})();