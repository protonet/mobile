protonet.media.embed.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  
  render: function(src, size) {
    var options   = $.extent({ extent: false }, size),
        $element  = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, options) });
    return $element;
  }
};