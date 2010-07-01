protonet.text_extensions.render.flash = (function() {
  var index = 1, swfObjectParams = {
    allowfullscreen: true,
    wmode: "opaque"
  };
  
  return function(data) {
    var anchor = protonet.text_extensions.render.image(data, true),
        placeholderId = "swfobject-placeholder-" + index++;
    
    anchor.attr("id", placeholderId).click(function(event) {
      event.preventDefault();
      
      swfobject.embedSWF(
        data.flash,
        placeholderId,
        "auto", "auto", "8",
        null, {}, swfObjectParams
      );
    });
    
    return anchor;
  };
})();
