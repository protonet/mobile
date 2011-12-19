//= require "../../../lib/plupload/src/javascript/plupload.js"
//= require "../../../lib/plupload/src/javascript/plupload.html5.js"
//= require "../../../lib/plupload/src/javascript/plupload.html4.js"
//= require "../../../lib/plupload/src/javascript/plupload.flash.js"
//= require "../../../ui/file_queue.js"

/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var maxFileSize       = ($.browser.mozilla && !window.FormData) ? "100mb" : "2000mb",
      $body             = $("body"),
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
  
  var uploader = new plupload.Uploader({
    runtimes:       "html5,flash,html4",
    browse_button:  "attach-file-extension",
    max_file_size:  maxFileSize,
    url:            protonet.config.node_base_url + "/upload",
    flash_swf_url:  "/flash/plupload.flash.swf",
    drop_element:   $form.attr("id")
  });
  
  uploader.bind("QueueChanged", function(uploader, files) {
    uploader.start();
  });
  
  uploader.bind("FileUploaded", function() {
    console.log("PULPLOAD: ALL FILES HAVE BEEN UPLOADED");
  });
  
  uploader.bind("FilesAdded", function(uploader, files) {
    protonet.ui.FileQueue.initialize();
    $form.trigger("dragleave");
    $.each(files, function(i, file) {
      protonet.ui.FileQueue.add(file);
    });
  });
  
  uploader.init();
  
  protonet.on("channel.change", function(channelId) {
    uploader.settings.multipart_params = {
      channel_id: channelId,
      user_id:    protonet.config.user_id,
      token:      protonet.config.token
    };
  });
  
  if (uploader.features.dragdrop) {
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
      
      event.preventDefault();
      
      $dropArea = $dropArea || $('<div>', {
        "class":  "drop-area",
        text:     "Drop it like it's hot!"
      }).appendTo($form);
      
      $body.addClass("dragenter");
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