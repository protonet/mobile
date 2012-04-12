//= require "../../../ui/file_queue.js"

/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var $body             = $("body"),
      $link             = $("#attach-file-extension");
  
  if (!$link.length) {
    return;
  }
  
  if (protonet.browser.IS_IOS()) {
    $link.hide();
    return;
  }
  
  if ($link.is(".disabled")) {
    return;
  }
  
  // It's currently impossible to upload files to a remote channel
  protonet.on("channel.change", function(channelId) {
    if (protonet.data.Channel.isGlobal(channelId)) {
      $link.hide();
    } else {
      $link.show();
    }
  });
  
  var fileQueue = protonet.ui.FileQueue.initialize({
    browse_button: $link.attr("id"),
    drop_element:  $form.attr("id")
  });
  
  if (fileQueue.uploader.features.dragdrop) {
    protonet.ui.Droppables.add({
      types:    "files",
      elements: "#user-widget, #message-form"
    });
  }
};