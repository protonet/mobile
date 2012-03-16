protonet.media.provider.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  
  render: function(src, size) {
    var options   = $.extend({ extent: false }, size),
        $element  = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, options) });
    console.log($element);
    return $element;
  }
};