protonet.data.File = (function() {
  var VIEW_BASE_URL = protonet.config.base_url      + "/files",
      NODE_BASE_URL = protonet.config.node_base_url + "/fs";
  
  return {
    getUrl: function(path) {
      if (!path || path === "/") {
        return VIEW_BASE_URL;
      }
      return VIEW_BASE_URL + "?path=" + encodeURIComponent(path);
    },
    
    getDownloadUrl: function(path) {
      return NODE_BASE_URL + "/download/?paths=" + encodeURIComponent(path)
    }
  };
})();