/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var $body             = $("body"),
      $link             = $("#attach-file-extension"),
      viewer            = protonet.config.user_id;
  
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
    var channelFolder = protonet.data.Channel.getFolder(channelId);
    if (protonet.data.Channel.isGlobal(channelId) || !protonet.data.User.hasWriteAccessToFile(viewer, channelFolder)) {
      if (droppable) {
        protonet.ui.Droppables.remove(droppable);
        droppable._removed = true;
      }
      $link.hide();
    } else {
      if (droppable && droppable._removed) {
        protonet.ui.Droppables.add(droppable);
      }
      $link.show();
    }
  });
  
  var fileQueue = new protonet.ui.files.Queue({
    browse_button:  $link.attr("id"),
    drop_element:   $form.attr("id"),
    shareImmediate: true,
    zIndex:         9
  });
  
  if (fileQueue.uploader.features.dragdrop) {
    var droppable = {
      types:    protonet.ui.Droppables.FILES.concat(protonet.FILES_MIME_TYPE),
      elements: "#message-form, #file-widget"
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