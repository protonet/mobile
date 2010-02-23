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
      BASE_URL = "http://images.pageglimpse.com/v1/thumbnails";
  
  function get(url, size) {
    var screenShotUrl = 
      BASE_URL +
      "?size=" + (size || DEFAULT_SIZE) + 
      "&devkey=" + KEY +
      "&url=" + encodeURIComponent(url) +
      "&nothumb=" + encodeURIComponent(protonet.config.base_url + "/images/transparent.gif");
    return screenShotUrl;
  }
  
  function isAvailable(url, size, callback) {
    var checkUrl = BASE_URL + "/exists" +
      "?url=" + encodeURIComponent(url) + 
      "&devkey=" + KEY +
      "&size=" + (size || DEFAULT_SIZE);
    
    var script = document.createElement("script");
    script.onload = function() {
      callback(true);
      $(script).remove();
    };
    script.onerror = function() {
      callback(false);
      $(script).remove();
    };
    script.async = true;
    script.src = checkUrl;
    document.body.appendChild(script);
  }
  
  return {
    get: get,
    isAvailable: isAvailable
  };
})();