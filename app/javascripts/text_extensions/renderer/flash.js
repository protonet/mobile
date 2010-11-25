protonet.text_extensions.render.flash = (function() {
  var index = 1, swfObjectParams = {
    allowfullscreen: true,
    wmode: "opaque",
    allowscriptaccess: "samedomain" // for security reasons, see http://kb2.adobe.com/cps/164/tn_16494.html
  };
  
  return function(data) {
    var anchor = protonet.text_extensions.render.image(data, true),
        placeholderId = "swfobject-placeholder-" + index++;
    
    anchor.attr("id", placeholderId).click(function(event) {
      if (!swfobject.hasFlashPlayerVersion("8")) {
        return;
      }
      
      event.preventDefault();
      
      var callback = function(event) {
        var flashElement = event.ref;
        if (flashElement) {
          $("<a>", {
            className: "flash-close-link close-link",
            html: "X",
            click: function() {
              $(this).detach();
              $(flashElement).replaceWith(anchor);
              anchor.css("visibility", "");
            }
          }).insertBefore(flashElement);
        }
      };
      
      swfobject.embedSWF(
        data.flash,
        placeholderId,
        "auto", "auto", "8",
        null, {}, swfObjectParams,
        {}, callback
      );
    });
    
    return anchor;
  };
})();
