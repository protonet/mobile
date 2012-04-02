//= require "../../../ui/file_queue.js"

/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var $body             = $("body"),
      $link             = $("#attach-file-extension"),
      $dropArea;
  
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
  
  fileQueue.uploader.bind("FilesAdded", function() {
    $form.trigger("dragleave");
  });
  
  if (fileQueue.uploader.features.dragdrop) {
    var bodyTimeout,
        formTimeout;
    
    $body.bind("dragover", function(event) {
      if (!event.dataTransfer.containsFiles()) {
        return;
      }
      
      clearTimeout(bodyTimeout);
      bodyTimeout = setTimeout(function() {
        $body.add($form).removeClass("dragenter");
      }, (1).seconds());
      
      $dropArea = $dropArea || $('<div>', {
        "class":  "drop-area",
        text:     protonet.t("DROP")
      }).appendTo($form);
      
      $body.addClass("dragenter");
      
      event.preventDefault();
    });
    
    $form.bind("dragover", function(event) {
      if (!event.dataTransfer.containsFiles()) {
        return;
      }
    
      clearTimeout(formTimeout);
      formTimeout = setTimeout(function() {
        $form.removeClass("dragenter");
      }, (0.5).seconds());
      
      $form.addClass("dragenter");
    });
  }
};