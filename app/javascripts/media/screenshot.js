//= require "../lib/webtoolkit.md5.js"
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
      NO_THUMB = protonet.config.base_url + "/img/screenshot_fetching.gif";
  
  /**
   * Get screenshot url
   */
  function get(url) {
    protonet.Notifications.bind("screenshot.workdone", function(event, response) {
      protonet.Notifications.unbind("screenshot.workdone");
      $("#text-extension-preview .media img").attr("src", protonet.config.base_url + response.result.screenshot)
    });
    requestScreenShot(url);
    // debugger;
    return protonet.config.base_url + "/externals/" + MD5(url) + "-clipped.png";
  }
  
  function requestScreenShot(url) {
    protonet.Notifications.trigger("socket.send", {"operation":"work", "task":"screenshot", "url": url});
  }
    
  return {
    get: get
  };
})();