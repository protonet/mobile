/**
 * Old screenshot provider:
 * http://images.websnapr.com/?size=s&key=F37b57d9hhLc&url=http://www.xing.com
 *
 * New screenshot provider:
 * http://images.pageglimpse.com/v1/thumbnails?url=http://www.xing.com&size=medium&devkey=ee8d7845b32edac0c2f50b5c288d1418
 */
protonet.media.ScreenShot = (function() {
  var DEFAULT_SIZE = "medium",
      KEY = "ee8d7845b32edac0c2f50b5c288d1418",
      BASE_URL = "http://images.pageglimpse.com/v1/thumbnails",
      NO_THUMB = encodeURIComponent(protonet.config.base_url + "/images/transparent.gif");
  
  function get(url, size) {
    var screenShotUrl = 
      BASE_URL +
      "?size=" + (size || DEFAULT_SIZE) + 
      "&devkey=" + KEY +
      "&url=" + encodeURIComponent(url) +
      "&nothumb=" + NO_THUMB;
    return screenShotUrl;
  }
  
  function isAvailable(url, size, callback) {
    /**
     * No jquery involved here for performance reasons
     * since this method could be invoked very often
     */
    var checkUrl = BASE_URL + "/exists" +
      "?url=" + encodeURIComponent(url) + 
      "&devkey=" + KEY +
      "&size=" + (size || DEFAULT_SIZE);
    
    var script = document.createElement("script");
    script.onload = function() {
      callback(true);
      _removeScriptTag(script);
    };
    script.onerror = function() {
      callback(false);
      _removeScriptTag(script);
    };
    script.type = "text/javascript";
    script.async = true;
    script.src = checkUrl;
    document.body.appendChild(script);
  }
  
  function _removeScriptTag(script) {
    script.parentNode.removeChild(script);
    
    /**
     * Remove all properties first, to avoid potential memory leaks
     * try/catch to avoid js errors in IE
     */
    try {
      for (var prop in script) {
        delete script[prop];
      }
    } catch(e) {}
  }
  
  return {
    get: get,
    isAvailable: isAvailable
  };
})();