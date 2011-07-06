/**
 * Auto resizing for the textarea
 * Automatically increases height of textarea when text overflows
 * Designed for optimal performance
 */
protonet.timeline.Form.extensions.AutoResizer = function(input, wrapper) {
  if (!protonet.user.Browser.SUPPORTS_EVENT("input")) {
    return;
  }
  
  var inputElement      = input[0],
      wrapperElement    = wrapper[0],
      originalHeight    = inputElement.offsetHeight,
      oldHeight         = originalHeight,
      offset            = 10,
      scrollHeight,
      cloneElement      = (function() {
        // Properties which may effect space taken up by chracters:
        var props = ["height", "width", "lineHeight", "textDecoration", "letterSpacing", "fontSize", "fontFamily"],
            propOb = {};

        // Create object of styles to apply:
        $.each(props, function(i, prop) {
          propOb[prop] = input.css(prop);
        });
        
        // Clone the actual textarea removing unique properties
        // and insert before original textarea:
        var clone = input.clone().removeAttr("id").removeAttr("name").css({
            position: "absolute",
            top:      0,
            left:     "-9999px"
        }).css(propOb).attr("tabIndex", "-1").insertBefore(input);
        
        return clone[0];
      })();
  
  function updateHeight(useEffect) {
    cloneElement.value = inputElement.value;
    var scrollHeight = cloneElement.scrollHeight;
    
    if (scrollHeight <= originalHeight) {
      newHeight = originalHeight;
    } else {
      newHeight = scrollHeight + offset;
    }
    
    if (newHeight !== oldHeight) {
      if (useEffect === true) {
        wrapper.animate({ height: newHeight.px() }, 250);
      } else {
        wrapperElement.style.height = newHeight.px();
      }
      oldHeight = newHeight;
    }
  };
  
  input
    .bind("input", updateHeight)
    .css("overflow-y", "hidden");
  
  protonet.bind("form.submitted", function() {
    // delay for performance reasons
    setTimeout(function() { updateHeight(true); }, 100);
  });
};