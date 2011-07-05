//= require "../../../lib/webcam.js"
//= require "../../../ui/modal_window.js"

/**
 * Webcam snapshots
 */
protonet.timeline.Form.extensions.Snapshots = function(input, wrapper, form) {
  if (!window.webcam) {
    return;
  }
  
  if (!protonet.user.Browser.HAS_FLASH(9)) {
    return;
  }
  
  webcam.set_swf_url("/flash/webcam.swf");
  webcam.set_shutter_sound(true, "/sounds/shutter.mp3");
  
  function getCurrentTextExtension() {
    try {
      return JSON.parse(form.find("#text-extension-input").val());
    } catch(e) {
      return null;
    }
  }
  
  var modalWindow;
  
  form.find("[data-extension=snapshot]").click(function() {
    modalWindow = modalWindow || new protonet.ui.ModalWindow("snapshot-page");
    
    var button    = $("<button>", {
      text:  "Snap!",
      click: function() {
        button.addClass("loading");
        webcam.snap(protonet.config.node_base_url + "/snapshooter", function(photoUrl) {
          modalWindow.hide();
          photoUrl = protonet.config.base_url + photoUrl;
          var oldTextExtension = getCurrentTextExtension(),
              newTextExtension = { type: "snapshot", url: photoUrl };
          if (oldTextExtension && oldTextExtension.type === newTextExtension.type) {
            $.extend(newTextExtension, {
              imageHref: $.makeArray(oldTextExtension.imageHref).concat([photoUrl]),
              image:     $.makeArray(oldTextExtension.image).concat([photoUrl]),
              title:    "Snapshots by @" + protonet.config.user_name
            });
          } else {
            $.extend(newTextExtension, {
              imageHref:  photoUrl,
              image:      photoUrl,
              title:      "Snapshot by @" + protonet.config.user_name
            });
          }
          
          protonet.trigger("text_extension_input.render", newTextExtension);
          input.focus();
        });
      }
  });
  
  modalWindow
    .headline(
      "Take a snapshot!"
    )
    .content(
      $("<div>").append(webcam.get_html(500, 350)).append(button)
    )
    .show();
});
};