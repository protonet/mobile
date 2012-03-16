protonet.media.provider.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  
  render: function(src, size) {
    var deferred = $.Deferred(),
        options  = $.extend({ extent: false }, size),
        $element = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, options) });
    deferred.resolve($element);
    return deferred.promise();
  }
};