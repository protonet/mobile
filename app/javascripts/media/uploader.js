//= require "../lib/plupload/src/javascript/plupload.js"
//= require "../lib/plupload/src/javascript/plupload.html5.js"
//= require "../lib/plupload/src/javascript/plupload.html4.js"
//= require "../lib/plupload/src/javascript/plupload.flash.js"

/**
 * Wrapper for the plupload lib
 */
protonet.media.Uploader = (function() {
  var defaultConfig = {
    max_file_size:  ($.browser.mozilla && !window.FormData) ? "250mb" : "10000mb",
    runtimes:       "html5,flash,html4",
    flash_swf_url:  "/flash/plupload.flash.swf",
    url:            protonet.config.node_base_url + "/fs/upload"
  };
  
  var THROTTLE_TIME = 300;
  
  var lastActionDate = new Date();
  
  function throttle() {
    var currentDate = new Date();
    if ((currentDate - lastActionDate) < THROTTLE_TIME) {
      return true;
    }
    
    lastActionDate = currentDate;
    return false;
  }
  
  return function(config) {
    config = $.extend({}, defaultConfig, config);
    
    var uploader = new plupload.Uploader(config),
        $flashContainer,
        $fileInput;
    
    uploader.bind("QueueChanged", function(uploader) {
      uploader.settings.multipart_params = {
        user_id:  protonet.config.user_id,
        token:    protonet.config.token
      };
      uploader.start();
    });
    
    var originalBind = uploader.bind;
    uploader.bind = function(eventName, callback) {
      if (eventName === "UploadProgress") {
        var originalCallback = callback;
        callback = function(file) {
          if (throttle() && file.percent < 100) {
            return;
          }
          
          originalCallback.apply(this, $.makeArray(arguments));
        };
      }
      originalBind.apply(uploader, $.makeArray(arguments));
    };
    
    uploader.disable = function() {
      $flashContainer.hide();
      $fileInput.attr("disabled", "disabled");
    };
    
    uploader.enable = function() {
      $flashContainer.show();
      $fileInput.removeAttr("disabled");
    };
    
    uploader.init();
    
    $flashContainer = $("#" + uploader.id + "_flash_container");
    $fileInput      = $("#" + uploader.id + "_html5, form[target='" + uploader.id + "_iframe'] input[type=file]");
    
    return uploader;
  };
})();