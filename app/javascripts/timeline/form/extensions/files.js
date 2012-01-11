//= require "../../../ui/file_queue.js"

/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var $body             = $("body"),
      $dropArea;
  
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
    browse_button: "attach-file-extension",
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
      }, (1.5).seconds());
      
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