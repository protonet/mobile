//= require "../../../media/webcam.js"

/**
 * Webcam snapshots
 */
protonet.timeline.Form.extensions.Snapshots = function($input, $wrapper, $form) {
  var $link = $form.find("[data-extension=snapshot]");
  
  if (!new protonet.media.Webcam().supported()) {
    $link.hide();
    return;
  }
  
  if ($link.is(".disabled")) {
    return;
  }
  
  function getCurrentTextExtension() {
    try {
      return JSON.parse($form.find("#text-extension-input").val());
    } catch(e) {
      return null;
    }
  }
  
  protonet.on("channel.change", function(channelId) {
    if (protonet.data.Channel.isGlobal(channelId)) {
      $link.hide();
    } else {
      $link.show();
    }
  });
  
  var modalWindow;
  
  $link.click(function() {
    protonet.ui.ModalWindow.show("/snapshots");
    
    protonet.off("snapshot:done").on("snapshot:done", function(photoUrl) {
      protonet.trigger("modal_window.hide");
      
      var oldTextExtension = getCurrentTextExtension();
      if (oldTextExtension && oldTextExtension.type === "Image") {
        var urls = $.makeArray(oldTextExtension.image || oldTextExtension.images).concat(photoUrl);
      } else {
        var urls = [photoUrl];
      }
      
      protonet.trigger("text_extension_input.select", urls);
      $input.focus();
    });
  });
};