//= require "../../lib/plupload/src/javascript/plupload.js"
//= require "../../lib/plupload/src/javascript/plupload.html5.js"
//= require "../../lib/plupload/src/javascript/plupload.html4.js"
//= require "../../lib/plupload/src/javascript/plupload.flash.js"

/**
 * Wrapper for the plupload lib
 */
protonet.media.Uploader = (function() {
  var undef;
  
  var xhrSupport = (function() {
    var xhr = new (window.XMLHttpRequest || $.noop)();
    return !!(xhr.sendAsBinary || xhr.upload);
  })();
  
  var defaultConfig = {
    max_file_size:  Infinity,
    // Only use chunking with m
    chunk_size:     xhrSupport ? "100mb" : 0,
    runtimes:       "html5,flash,html4",
    flash_swf_url:  "/flash/plupload.flash.swf",
    url:            protonet.config.node_base_url + "/fs/upload",
    zIndex:         999
  };
  
  var THROTTLE_TIME = 300;
  
  return function(config) {
    config = $.extend({}, defaultConfig, config);
    
    var uploader = new plupload.Uploader(config);
    
    // Default target folder is the user's file store
    var basePath = protonet.data.User.getFolder(protonet.config.user_id);
    
    uploader.bind("FilesAdded", function(uploader, files) {
      uploader.settings.multipart_params = {
        user_id:        protonet.config.user_id,
        token:          protonet.config.token
      };
      
      $.each(files, function(i, file) {
        var targetFilePath = basePath + file.relativePath;
        file.basePath = basePath;
        file.targetPath = protonet.data.File.getFolder(targetFilePath);
      });
      
      setTimeout(function() {
        uploader.start();
      }, 0);
    });
    
    uploader.bind("BeforeUpload", function(uploader, file) {
      uploader.settings.multipart_params.target_folder = file.targetPath;
    });
    
    uploader.bind("Error", function(uploader, error) {
      // Report it to airbrake
      setTimeout(function() {
        throw new Error(JSON.stringify(error));
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
          if (throttle() && file.percent < 99) { return; }
          originalCallback.apply(this, arguments);
        };
      } else if (eventName === "FileUploaded") {
        callback = function(uploader, file, xhr) {
          if (file._error) { return; }
          
          xhr.responseText = xhr.response || "null";
          xhr.responseJSON = JSON.parse(xhr.responseText);
          
          if (!xhr.responseJSON) {
            file._error = true;
            uploader.trigger("Error", {
              code: -999, // custom error
              file: file,
              response: xhr.response,
              status: xhr.httpStatus
            });
            return;
          }
          
          originalCallback.apply(this, arguments);
        };
      }
      originalBind.call(this, eventName, callback);
    };
    
    // opposite of uploader.disableBrowse()
    uploader.enableBrowse = function() {
      uploader.disableBrowse(false);
    };
    
    uploader.setBasePath = function(path) {
      basePath = path;
    };
    
    uploader.getBasePath = function() {
      return basePath;
    };
    
    var originalDestroy = uploader.destroy;
    uploader.destroy = function() {
      if (uploader.files.length) {
        uploader.bind("UploadComplete", function() {
          setTimeout(function() { uploader.unbindAll(); }, 0);
        });
        
        try {
          // This triggers an exception if the element is already removed from the DOM
          uploader.trigger("Destroy");
        } catch(e) {}
      } else {
        originalDestroy.apply(this, arguments);
      }
    };
    
    uploader.pause = function() {
      this.state = plupload.STOPPED;
    };
    
    uploader.bind("UploadComplete", function(uploader, files) {
      uploader.splice(0, files.length);
    });
    
    $window.on("resize", function() {
      uploader.trigger("Refresh");
    });
    
    uploader.init();
    
    $("#" + uploader.id + "_flash_container").css("z-index", config.zIndex);
    
    return uploader;
  };
})();