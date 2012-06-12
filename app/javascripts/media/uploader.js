//= require "../lib/plupload/src/javascript/plupload.js"
//= require "../lib/plupload/src/javascript/plupload.html5.js"
//= require "../lib/plupload/src/javascript/plupload.html4.js"
//= require "../lib/plupload/src/javascript/plupload.flash.js"

/**
 * Wrapper for the plupload lib
 */
protonet.media.Uploader = (function() {
  var defaultConfig = {
    max_file_size:  ($.browser.mozilla && !window.FormData) ? "250mb" : "100000mb",
    runtimes:       "html5,flash,html4",
    flash_swf_url:  "/flash/plupload.flash.swf",
    url:            protonet.config.node_base_url + "/fs/upload"
  };
  
  var THROTTLE_TIME = 300;
  
  return function(config) {
    config = $.extend({}, defaultConfig, config);
    
    var uploader = new plupload.Uploader(config);
    
    // Default target folder is the user's file store
    var targetFolder = protonet.data.User.getFolder(protonet.config.user_id);
    
    uploader.bind("FilesAdded", function(uploader) {
      uploader.settings.multipart_params = {
        user_id:        protonet.config.user_id,
        token:          protonet.config.token,
        target_folder:  targetFolder
      };
      
      setTimeout(function() {
        uploader.start();
      }, 0);
    });
    
    // throttle
    // TODO: Move this into our own plupload fork some day
    var originalBind = uploader.bind;
    uploader.bind = function(eventName, callback) {
      var originalCallback = callback;
      
      var lastActionDate = new Date();

      function throttle() {
        var currentDate = new Date();
        if ((currentDate - lastActionDate) < THROTTLE_TIME) {
          return true;
        }

        lastActionDate = currentDate;
        return false;
      }
      
      if (eventName === "UploadProgress") {
        callback = function(uploader, file) {
          if (throttle() && file.percent < 100) { return; }
          originalCallback.apply(this, arguments);
        };
      } else if (eventName === "FileUploaded") {
        callback = function(uploader, file, xhr) {
          xhr.responseText = xhr.response;
          xhr.responseJSON = JSON.parse(xhr.response);
          originalCallback.apply(this, arguments);
        };
      }
      originalBind.call(this, eventName, callback);
    };
    
    // opposite of uploader.disableBrowse()
    uploader.enableBrowse = function() {
      uploader.disableBrowse(false);
    };
    
    uploader.setTargetFolder = function(path) {
      targetFolder = path;
    };
    
    uploader.getTargetFolder = function() {
      return targetFolder;
    };
    
    uploader.bind("UploadComplete", function(uploader, files) {
      uploader.splice(0, files.length);
    });
    
    $window.on("resize", function() {
      uploader.trigger("Refresh");
    });
    
    uploader.init();
    
    return uploader;
  };
})();