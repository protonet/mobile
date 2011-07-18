protonet.media.ScreenShot = (function() {
  
  /**
   * Get screenshot url
   */
  function get(url) {
    return protonet.config.node_base_url + "/screenshooter?url=" + encodeURIComponent(url);
  }
  
  return {
    get: get
  };
})();