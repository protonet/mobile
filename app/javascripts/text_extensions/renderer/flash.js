protonet.text_extensions.render.flash = (function() {
  var index = 1,
      swfObjectParams = {
        allowfullscreen: true,
        wmode: "opaque",
        allowscriptaccess: "samedomain" // for security reasons, see http://kb2.adobe.com/cps/164/tn_16494.html
      };
  
  return function(data) {
    var anchor = protonet.text_extensions.render.image(data, true),
        placeholderId = "swfobject-placeholder-" + index++;
    
    anchor.attr("id", placeholderId).bind("click", function(event) {
      if (!swfobject.hasFlashPlayerVersion("8")) {
        return;
      }
      
      event.preventDefault();
      
      var callback = function(event) {
        var flashElement = event.ref;
        if (flashElement) {
          flashElement = $(flashElement).trigger("text_extension.show_flash");
          $("<a>", {
            "class": "flash-close-link close-link",
            html: "X",
            mousedown: false, // ensure that meep isn't accidentally focused
            click: function() {
              $(this).remove();
              flashElement.replaceWith(anchor);
              anchor
                .css("visibility", "")
                .trigger("text_extension.hide_flash");
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
