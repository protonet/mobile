//= require "../../../lib/plupload/src/javascript/plupload.js"
//= require "../../../lib/plupload/src/javascript/plupload.html5.js"
//= require "../../../lib/plupload/src/javascript/plupload.html4.js"
//= require "../../../lib/plupload/src/javascript/plupload.flash.js"

/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var maxFileSize       = ($.browser.mozilla && !window.FormData) ? "100mb" : "2000mb",
      $dropArea;
    
  var uploader = new plupload.Uploader({
    runtimes:       "html5,flash,html4",
    browse_button:  "attach-file-extension",
    max_file_size:  maxFileSize,
    url:            protonet.config.node_base_url + "/upload",
    flash_swf_url:  "/flash/plupload.flash.swf",
    drop_element:   $form.attr("id")
  });
  
  protonet.on("channel.change", function(channelId) {
    uploader.settings.multipart_params = {
      channel_id: channelId,
      user_id:    protonet.config.user_id,
      token:      protonet.config.token
    };
  });
  
  uploader.bind("QueueChanged", function(uploader, files) {
    uploader.start();
  });
  
  uploader.bind("FileUploaded", function() {
    console.log("PULPLOAD: ALL FILES HAVE BEEN UPLOADED");
  });
  
  uploader.bind("FilesAdded", function(uploader, files) {
    $form.trigger("dragleave");
  });
  
  $form.bind({
    dragover: function(event) {
      // if (!uploader.features.dragdrop) {
      //   return;
      // }
      // 
      // var types = $.makeArray(event.originalEvent.dataTransfer.types);
      // if (types.indexOf("Files") == -1) {
      //   return;
      // }
      
      // event.preventDefault();
      
      //console.log("FILES:", event.originalEvent.dataTransfer.types.length);
      // console.log("types is instance of an array", event.originalEvent.dataTransfer.types instanceof Array)
      // console.dir(event.originalEvent.dataTransfer.types)
      // // console.log("FILES:", event.originalEvent.dataTransfer.types[0] + ' and ' + event.originalEvent.dataTransfer.types[1] + ' and ' + event.originalEvent.dataTransfer.types[2]);
      // $dropArea = $dropArea || $('<div>', {
      //   "class": "drop-area",
      //   text: "Drop it like it's hot!"
      // }).appendTo($form);
      // 
      // $form.addClass("dragenter");
    },
    
    dragleave: function(event) {
      // event.preventDefault();
      // $form.removeClass("dragenter");
    }
  });
  
  uploader.init();
};