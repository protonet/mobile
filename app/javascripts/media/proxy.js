//= require "../utils/convert_to_absolute_url.js"
//= require "../utils/escape_for_reg_exp.js"

protonet.media.Proxy = (function() {
  var BASE_URL        = protonet.config.node_base_url + "/image_proxy",
      IMAGE_URL       = BASE_URL + "?url={url}",
      HTTP_TIMEOUT    = 5000,
      REG_EXP_EXTRACT = new RegExp(protonet.utils.escapeForRegExp(BASE_URL) + "\\/?.*?(?:\\?|&)url\\=(.+?)(?:&|#|$)");
  /**
   * Fetches remote content via WebSockets and node.js
   */
  function httpGet(url, onSuccess, onFailure) {
    var timeout = setTimeout(function() {
      protonet.off("http_proxy.workdone");
      onFailure();
    }, HTTP_TIMEOUT);
    
    protonet.one("http_proxy.workdone", function(event, response) {
      clearTimeout(timeout);
      if (response.result && response.result.statusCode == 200) {
        onSuccess(response.result.body);
      } else {
        onFailure();
      }
    });
    
    protonet.trigger("socket.send", {
      operation:  "work",
      task:       "http_proxy",
      url:        url
    });
  }
  
  /**
   * Takes a url like
   * http://localhost:8124/image_proxy?url=http%3A%2F%2Flocalhost%3A3000%2Fsystem%2Favatars%2F3%2Foriginal%2FFoto%204.jpg%3F1300993152&width=36&height=36&type=.jpg
   * and extracts + returns the proxied url
   */
  function extractOriginalImageUrl(url) {
    var match = url.match(REG_EXP_EXTRACT);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return url;
  }
  
  /**
   * Get image proxy url
   * Optional size parameter causes server side cropping
   */
  function getImageUrl(url, options) {
    if (url.match(REG_EXP_EXTRACT)) {
      url = extractOriginalImageUrl(url);
    } else {
      url = protonet.utils.convertToAbsoluteUrl(url);
    }
    
    options = $.extend({ extent: url.indexOf(".gif") === -1 }, options);
    
    var imageUrl = IMAGE_URL.replace("{url}", encodeURIComponent(url));
    imageUrl += "&width=" + (options.width || "") + "&height=" + (options.height || "") + "&extent=" + options.extent;
    return imageUrl + "&type=.jpg"; // append fake file type for easy file detection later
  }
  
  return {
    httpGet:                  httpGet,
    getImageUrl:              getImageUrl,
    extractOriginalImageUrl:  extractOriginalImageUrl
  };
})();