protonet.media.provider.Flash = {
  supportedMimeTypes: ["application/x-shockwave-flash"],
  
  render: function(file, size) {
    var deferred = $.Deferred(),
        $element = $("<div>", { "class": "object" });
    
    $("<embed>").attr({
      width:              "100%",
      height:             "100%",
      type:               "application/x-shockwave-flash",
      allowscriptaccess:  "never",
      allowfullscreen:    true,
      wmode:              "window",
      scale:              "noscale",
      salign:             "tl",
      src:                protonet.data.File.getDownloadUrl(file.path, { embed: true })
    }).appendTo($element);
    
    deferred.resolve($element);
    
    return deferred.promise();
  }
};