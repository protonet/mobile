protonet.media.getProxyUrl = (function() {
  var URL_TEMPLATE = "/images/externals/resize/{width}/{height}/{url}",
      defaultSize = { width: 0, height: 0 }; // 0x0 => original size (Logic by Mr. Failveh)
  
  return function(url, size) {
    size = $.extend(defaultSize, size);
    return URL_TEMPLATE
      .replace("{url}", encodeURIComponent(url))
      .replace("{width}", size.width)
      .replace("{height}", size.height);
  };
})();