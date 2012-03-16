protonet.media.embed.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  
  render: function(src, size) {
    var $element = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, size) });
    return $element;
  }
};