protonet.media.provider.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/svg+xml", "image/tiff", "application/postscript"],
  
  render: function(file, size) {
    var deferred = $.Deferred(),
        options  = { extent: false, width: size.width },
        src      = protonet.data.File.getDownloadUrl(file.path),
        $element = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, options) });
    
    $element.one({
      load: function() {
        deferred.resolve($element);
      },
      error: function() {
        deferred.reject($element);
      }
    });
    
    return deferred.promise();
  }
};