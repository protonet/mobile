protonet.media.provider.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/svg+xml", "image/tiff", "application/postscript"],
  
  supports: function(file) {
    return this.supportedMimeTypes.indexOf(file.mime) !== -1;
  },
  
  render: function(file, $container) {
    var deferred = $.Deferred(),
        options  = { extent: false, width: $container.width() },
        src      = protonet.data.File.getDownloadUrl(file.path),
        $element = $("<img>", { src: protonet.media.Proxy.getImageUrl(src, options) });
    
    $element.one("error", function() {
      deferred.reject($element);
    });
    
    $container.html($element);
    deferred.resolve($element);
    
    return deferred.promise();
  }
};