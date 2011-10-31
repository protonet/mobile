/**
 * Webcam snapshots
 */
protonet.timeline.Form.extensions.Snapshots = function($input, $wrapper, $form) {
  $link = $form.find("[data-extension=snapshot]");
  
  if (!protonet.user.Browser.HAS_FLASH(9)) {
    $link.hide();
    return;
  }
  
  function getCurrentTextExtension() {
    try {
      return JSON.parse($form.find("#text-extension-input").val());
    } catch(e) {
      return null;
    }
  }
  
  var modalWindow;
  
  $link.click(function() {
    protonet.ui.ModalWindow.show("/snapshots");
    
    protonet.off("snapshot:done").on("snapshot:done", function(photoUrl) {
      protonet.trigger("modal_window.hide");
      
      var oldTextExtension = getCurrentTextExtension(),
          newTextExtension = { type: "snapshot", url: photoUrl },
          title            = protonet.t("SNAPSHOT_TITLE", { user_name: protonet.config.user_name });
      if (oldTextExtension && oldTextExtension.type === newTextExtension.type) {
        $.extend(newTextExtension, {
          imageHref: $.makeArray(oldTextExtension.imageHref).concat([photoUrl]),
          image:     $.makeArray(oldTextExtension.image).concat([photoUrl]),
          title:    title.replace("{s}", "s")
        });
      } else {
        $.extend(newTextExtension, {
          imageHref:  photoUrl,
          image:      photoUrl,
          title:      title.replace("{s}", "")
        });
      }
      
      protonet.trigger("text_extension_input.render", newTextExtension);
      $input.focus();
    });
  });
};