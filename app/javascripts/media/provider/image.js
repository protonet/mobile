//= require "../try_to_load_image.js"

protonet.media.provider.Image = {
  supportedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/svg+xml", "image/tiff", "application/postscript"],
  
  supports: function(file) {
    return this.supportedMimeTypes.indexOf(file.mime) !== -1;
  },
  
  render: function(file, $container) {
    var deferred = $.Deferred(),
        options  = { extent: false, width: $container.width(), cacheKey: new Date(file.modified).getTime() },
        src      = protonet.data.File.getDownloadUrl(file.path);
    
    src = protonet.media.Proxy.getImageUrl(src, options);
    
    protonet.media.tryToLoadImage(src, function() {
      var $element = $("<img>", { src: src });
      
      $element.one("error", function() {
        deferred.reject($element);
      });
      
      $container.html($element);
      deferred.resolve($element);
    });
    
    return deferred.promise();
  }
};