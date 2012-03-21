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
  
  function hasFiles(dataTransfer) {
    if (!dataTransfer || typeof(dataTransfer.files) === "undefined") {
      return false;
    }
    
    var types = plupload.toArray(dataTransfer.types || []);
    return types.indexOf("public.file-url") !== -1 || // Safari < 5
      types.indexOf("application/x-moz-file") !== -1 || // Gecko < 1.9.2 (< Firefox 3.6)
      types.indexOf("Files") !== -1 || // Standard
      types.length === 0;
  }
  
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
      if (!hasFiles(event.originalEvent.dataTransfer)) {
        return;
      }
      
      clearTimeout(bodyTimeout);
      bodyTimeout = setTimeout(function() {
        $body.add($form).removeClass("dragenter");
      }, (1).seconds());
      
      $dropArea = $dropArea || $('<div>', {
        "class":  "drop-area",
        text:     "Drop it like it's hot!"
      }).appendTo($form);
      
      $body.addClass("dragenter");
      
      event.preventDefault();
    });
    
    $form.bind("dragover", function(event) {
      if (!hasFiles(event.originalEvent.dataTransfer)) {
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