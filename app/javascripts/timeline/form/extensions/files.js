/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var $body             = $("body"),
      $link             = $("#attach-file-extension"),
      viewer            = protonet.config.user_id,
      currentChannelId;
  
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
    currentChannelId = channelId;
    if (protonet.data.Channel.isGlobal(channelId)) {
      $link.hide();
    } else {
      $link.show();
    }
  });
  
  var fileQueue = new protonet.ui.files.Queue({
    browse_button:  $link.attr("id"),
    drop_element:   $form.attr("id"),
    shareImmediate: true
  });
  
  if (fileQueue.uploader.features.dragdrop) {
    var droppable = {
      types:    protonet.ui.Droppables.FILES.concat(protonet.FILES_MIME_TYPE),
      elements: "#message-form, #file-widget",
      condition: function() {
        return protonet.data.User.hasWriteAccessToFile(viewer, protonet.data.Channel.getFolder(currentChannelId));
      }
    };
    
    if (!protonet.ui.ModalWindow.isVisible()) {
      protonet.ui.Droppables.add(droppable);
    }
    
    protonet.on("modal_window.shown", function() {
      protonet.ui.Droppables.remove(droppable);
    });
    
    protonet.on("modal_window.hidden", function() {
      protonet.ui.Droppables.add(droppable);
    });
  }
};