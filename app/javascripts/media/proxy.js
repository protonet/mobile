protonet.media.Proxy = (function() {
  var IMAGE_URL = "/image_proxy?url={url}",
      IMAGE_AVAILABLE_URL = "/images/externals/is_available?image_file_url={url}",
      HTTP_TIMEOUT = 5000;
  
  /**
   * Fetches remote content via WebSockets and node.js
   */
  function httpGet(url, onSuccess, onFailure) {
    var timeout = setTimeout(function() {
      protonet.Notifications.unbind("http_proxy.workdone");
      onFailure();
    }, HTTP_TIMEOUT);
    
    protonet.Notifications.bind("http_proxy.workdone", function(event, response) {
      clearTimeout(timeout);
      protonet.Notifications.unbind("http_proxy.workdone");
      if (response.result && response.result.statusCode == 200) {
        onSuccess(response.result.body);
      } else {
        onFailure();
      }
    });
    
    protonet.Notifications.trigger("socket.send", {
      operation:  "work",
      task:       "http_proxy",
      url:        url
    });
  }
  
  /**
   * Get image proxy url
   * Optional size parameter causes server side cropping
   */
  function getImageUrl(url, size) {
    var imageUrl = IMAGE_URL.replace("{url}", encodeURIComponent(url));
    if (size) {
      imageUrl + "&width=" + size.width + "&height=" + size.height;
    }
    return imageUrl;
  }
  
  return {
    httpGet: httpGet,
    getImageUrl: getImageUrl
  };
})();