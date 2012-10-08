protonet.text_extensions.render.flash = (function() {
  var index = 1,
      swfObjectParams = {
        allowfullscreen: true,
        wmode: "opaque",
        allowscriptaccess: "samedomain" // for security reasons, see http://kb2.adobe.com/cps/164/tn_16494.html
      };
  
  return function(data) {
    if (!data.image) {
      return;
    }
    
    var anchor        = protonet.text_extensions.render.image(data, true),
        placeholderId = "swfobject-placeholder-" + index++,
        placeholder,
        visible,
        flashElement,
        closeLink;
    
    //anchor.mousedown(false).bind("click", function(event) {
    //  if (!protonet.browser.HAS_FLASH(8)) {
    //    return;
    //  }
    //  
    //  var callback = function(event) {
    //    flashElement = event.ref;
    //    if (flashElement) {
    //      flashElement  = $(flashElement).trigger("text_extension.show_media");
    //      closeLink     = closeLink || $("<a>", {
    //        "class":    "media-close-link close-link",
    //        html:       "&times;",
    //        mousedown:  false, // ensure that meep isn't accidentally focused
    //        click:      function() {
    //          closeLink.detach();
    //          flashElement.replaceWith(anchor);
    //          anchor.trigger("text_extension.hide_media");
    //          visible = false;
    //        }
    //      });
    //      
    //      closeLink.insertAfter(flashElement);
    //      
    //      protonet.one("channel.change", function() {
    //        if (visible) {
    //          closeLink.click();
    //        }
    //      });
    //      
    //      visible = true;
    //    }
    //  };
    //  
    //  placeholder = placeholder || $("<span>", { id: placeholderId });
    //  placeholder.insertBefore(anchor);
    //  anchor.detach();
    //  
    //  swfobject.embedSWF(
    //    data.flash,
    //    placeholderId,
    //    "auto", "auto", "8",
    //    null, {}, swfObjectParams,
    //    {}, callback
    //  );
    //  
    //  event.preventDefault();
    //});
    
    return anchor;
  };
})();
