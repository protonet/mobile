//= require "../try_to_load_image.js"

protonet.media.provider.Image = {
  supports: function(file) {
    return protonet.data.File.isImage(file.path);
  },
  
  render: function(file, $container) {
    var deferred = $.Deferred(),
        options  = { extent: false, width: $container.width(), cacheKey: new Date(file.modified).getTime() },
        src      = protonet.data.File.getDownloadUrl(file.path);
    
    src = protonet.media.Proxy.getImageUrl(src, options);
    
    protonet.media.tryToLoadImage(src, function() {
      var $element = $("<img>", { src: src });
      
      $element.one("error", function() {
        deferred.reject();
      });
      
      $container.html($element);
      deferred.resolve($element);
    }, function() {
      deferred.reject();
    });
    
    return deferred.promise();
  }
};