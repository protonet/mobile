protonet.media.provider.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  
  render: function(file, size) {
    var deferred = $.Deferred(),
        options  = $.extend({ extent: false }, size),
        src      = protonet.data.File.getDownloadUrl(file.path),
        $element = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, options) });
    deferred.resolve($element);
    return deferred.promise();
  }
};