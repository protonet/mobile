protonet.media.provider.Code = {
  supportedMimeTypes: ["application/javascript", "application/json", "application/xml", "text/html", "text/css", "text/javascript"],
  
  render: function(src, size) {
    $.ajax
    var options   = $.extend({ extent: false }, size),
        $element  = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, options) });
    return $element;
  }
};