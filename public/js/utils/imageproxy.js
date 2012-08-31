protonet.utils.ImageProxy = (function() {
  var BASE_URL        = protonet.config.node_base_url + "/image_proxy",
      IMAGE_URL       = BASE_URL + "?url={url}",
      REG_EXP_EXTRACT = new RegExp(protonet.utils.escapeForRegExp(BASE_URL) + "\\/?.*?(?:\\?|&)url\\=(.+?)(?:&|#|$)");
  
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
    
    var isGif = url.indexOf(".gif") !== -1,
        isPsd = url.indexOf(".psd") !== -1;
    
    options = $.extend({ extent: !isGif && !isPsd, flatten: isPsd }, options);
    
    var imageUrl = IMAGE_URL.replace("{url}", encodeURIComponent(url));
    imageUrl += "&width=" + (options.width || "") + "&height=" + (options.height || "") + "&extent=" + options.extent + "&flatten=" + options.flatten;
    
    if (options.cacheKey) {
      imageUrl += "&cache_key=" + options.cacheKey;
    }
    
    return imageUrl + "&type=.jpg"; // append fake file type for easy file detection later
  }
  
  function isProxied(url) {
    return url.startsWith(BASE_URL);
  }
  
  return {
    isProxied:                isProxied,
    getImageUrl:              getImageUrl,
    extractOriginalImageUrl:  extractOriginalImageUrl
  };
})();