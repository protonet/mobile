//= require "../../../lib/plupload.min.js"
//= require "../../../lib/plupload.html5.min.js"
//= require "../../../lib/plupload.flash.min.js"

/**
 * File attachments
 */
protonet.timeline.Form.extensions.Files = function($input, $wrapper, $form) {
  var $link = $form.find("[data-extension=file]");
  
  var maxFileSize   = ($.browser.mozilla && !window.FormData) ? "100mb" : "2000mb";
    
  var uploader = new plupload.Uploader({
    runtimes:       "html5,flash",
    browse_button:  "attach-file-extension",
    max_file_size:  maxFileSize,
    url:            protonet.config.node_base_url + "/upload",
    flash_swf_url:  "/flash/plupload.flash.swf"
    // drop_element:   "file-widget"
  });
  
  protonet.on("channel.change", function(channelId) {
    console.log("PLUPLOAD: SET CHANNEL ID AND USER ID");
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
  
  uploader.init();
};