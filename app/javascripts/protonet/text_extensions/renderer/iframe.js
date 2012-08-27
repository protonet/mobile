protonet.text_extensions.render.iframe = function(data) {
  if (!data.image) {
    return;
  }
  
  var anchor = protonet.text_extensions.render.image(data, true),
      iframe,
      visible,
      closeLink;
  
  anchor.mousedown(false).click(function(event) {
    // frameborder: 0 needed for IE8 (it's impossible to unset it via css)
    iframe    = iframe    || $("<iframe>", { src: data.iframe, frameborder: 0 });
    closeLink = closeLink || $("<a>", {
      "class":    "media-close-link close-link",
      html:       "&times;",
      mousedown:  false, // ensure that meep isn't accidentally focused
      click:      function() {
        closeLink.detach();
        iframe.replaceWith(anchor);
        anchor.trigger("text_extension.hide_media");
        visible = false;
      }
    });
    
    iframe.insertBefore(anchor);
    closeLink.insertBefore(anchor);
    anchor.detach();
    
    iframe.trigger("text_extension.show_media");
    
    protonet.one("channel.change", function() {
      if (visible) {
        closeLink.click();
      }
    });
    
    visible = true;
    
    event.preventDefault();
  });
  
  return anchor;
};