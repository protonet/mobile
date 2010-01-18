/**
 * Old screenshot provider:
 * http://images.websnapr.com/?size=s&key=F37b57d9hhLc&url=http://www.xing.com
 *
 * New screenshot provider:
 * http://images.pageglimpse.com/v1/thumbnails?url=http://www.xing.com&size=medium&devkey=ee8d7845b32edac0c2f50b5c288d1418
 */
protonet.media.getScreenShot = (function() {
  var DEFAULT_SIZE = "medium",
      KEY = "ee8d7845b32edac0c2f50b5c288d1418";
  
  return function(url, size) {
    var screenShotUrl = 
      "http://images.pageglimpse.com/v1/thumbnails" +
      "?size=" + (size || DEFAULT_SIZE) + 
      "&devkey=" + KEY +
      "&url=" + encodeURIComponent(url);
    return screenShotUrl;
  };
})();