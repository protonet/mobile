protonet.media.Proxy = (function() {
  var imageDefaultSize = { width: 0, height: 0 }, // 0x0 => original size (Logic by Mr. Failveh)
      // Apache decodes urls before giving them to rails, therefore we need to double encode them
      IMAGE_URL = "/images/externals/show?width={width}&height={height}&image_file_url={url}",
      IMAGE_AVAILABLE_URL = "/images/externals/is_available?image_file_url={url}";
  
  /**
   * Asynchronously checks if an image is already cached
   * callback is invoked with boolean status parameter
   */
  function isImageAvailable(url, callback) {
    $.getJSON(IMAGE_AVAILABLE_URL.replace("{url}", _prepareUrl(url)), function(response) {
      callback(response.is_available);
    });
  }
  
  /**
   * Get image proxy url
   * Optional size parameter causes server side cropping
   */
  function getImageUrl(url, size) {
    size = $.extend({}, imageDefaultSize, size);
    return IMAGE_URL
      .replace("{url}", _prepareUrl(url))
      .replace("{width}", size.width)
      .replace("{height}", size.height);
  }
  
  function _prepareUrl(url) {
    return encodeURIComponent(url);
  }
  
  return {
    isImageAvailable: isImageAvailable,
    getImageUrl: getImageUrl
  };
})();