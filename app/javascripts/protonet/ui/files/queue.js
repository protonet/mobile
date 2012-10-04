//= require "../../utils/prettify_file_size.js"
//= require "../confirm.js"

protonet.ui.files.Queue = (function() {
  var defaultConfig = {
    path: "/users/" + protonet.config.user_id + "/",
    shareImmediate: false
  };
  
  var $container, $header, $fileContainer, $statusContainer, $closeLink, $folderLink, $shareContainer, $errorContainer, $currentFile, currentFile, undef, collapsed, inProgress, queue = [];
  
  function confirmMessage() {
    return protonet.t("files.confirm_upload_cancel");
  }
  
  return Class.create({
    initialize: function(config) {
      this.config = $.extend({}, defaultConfig, config);
      inProgress = false;
      this.initUploader();
    },
    
    initUploader: function() {
      this.uploader = new protonet.media.Uploader(this.config);
      
      this.uploader.bind("FilesAdded", function(uploader, files) {
        if (!inProgress) {
          queue = [];
          this.create();
          inProgress = true;
        }
      }.bind(this));
      
      this.uploader.bind("BeforeUpload", function(uploader, file) {
        this.uploading(file);
      }.bind(this));
      
      this.uploader.bind("FileUploaded", function(uploader, file, xhr) {
        this.uploaded(file, xhr);
      }.bind(this));
      
      this.uploader.bind("Error", function(uploader, error) {
        if (error.file) {
          this.error(error.file);
        }
      }.bind(this));
      
      this.uploader.bind("UploadProgress", function(uploader, file) {
        this.progress(file);
      }.bind(this));
      
      this.uploader.bind("UploadComplete", function(uploader, files) {
        this.allUploaded();
      }.bind(this));
    },
    
    create: function() {
      if ($container) {
        return;
      }
      
      $container        = new protonet.utils.Template("file-queue-template").to$().appendTo("body");
      
      $header           = $container.find("h3");
      $fileContainer    = $container.find(".file-container");
      $shareContainer   = $container.find(".share-container");
      $errorContainer   = $container.find(".error-container");
      $statusContainer  = $container.find(".status");
      $closeLink        = $container.find(".close");
      $folderLink       = $container.find(".folder-link");
      
      this._observe();
    },
    
    add: function(file) {
      var $item = new protonet.utils.Template("file-queue-item-template", {
        name: file.name,
        url:  protonet.data.File.getUrl(this.config.path + file.name),
        size: protonet.utils.prettifyFileSize(file.size)
      }, true).to$();
      
      $fileContainer.html($item).stop(true, true).show().css({ opacity: 0 }).animate({ opacity: 1 }, "fast");
      
      this.status(file);
      
      return $item;
    },
    
    uploading: function(file) {
      $errorContainer.hide();
      $shareContainer.hide();
      
      $currentFile = this.add(file);
      currentFile = file;
      
      // Show confirm dialog if user leaves page before upload has finished
      $window.off("beforeunload.file_queue").on("beforeunload.file_queue", confirmMessage);
    },
    
    progress: function(file) {
      var percent       = file.percent === 100 ? 99 : file.percent,
          totalPercent  = this.uploader.total.percent === 100 ? 99 : this.uploader.total.percent,
          count         = this.uploader.files.length;
      
      $currentFile.find(".loading-bar").stop(true, true).animate({ width: percent + "%" }, 300);
      
      this.status(file);
    },
    
    error: function(file) {
      protonet.trigger("flash_message.error", protonet.t("files.flash_message_upload_error", file));
      
      $currentFile.addClass("error");
      $currentFile.find(".file-name").prepend($("<strong>", { text: protonet.t("files.hint_upload_error"), "class": "error" }));
      
      $errorContainer.show();
      $currentFile.find(".loading-bar-container").hide();
      
      this.expand();
      this.uploader.pause();
    },
    
    uploaded: function(file, xhr) {
      var data = xhr.responseJSON;
      
      queue.push(data);
      
      $currentFile
        .removeClass("uploading")
        .attr("href", protonet.data.File.getUrl(data.path));
    },
    
    allUploaded: function() {
      inProgress = false;
      
      $window.off("beforeunload.file_queue");
      $container.addClass("uploaded");
      
      var path = this.uploader.getTargetFolder();
      
      $statusContainer.html(
        protonet.t("files.hint_upload_success", {
          count: queue.length
        })
      );
      
      $folderLink
        .text(protonet.data.File.getName(path))
        .attr("href", protonet.data.File.getUrl(path));
      
      $fileContainer.hide();
      $errorContainer.hide();
      
      if (queue.length > 0) {
        $shareContainer.show();
      }
      
      if (this.config.shareImmediate) {
        this.share();
        this.collapse();
      } else {
        this.expand();
      }
    },
    
    _observe: function() {
      $header.on("click", this.toggle.bind(this));
      $fileContainer.on("click mousedown", ".uploading", false);
      
      $shareContainer.on("click", "button", function() {
        this.share();
        this.reset();
        return false;
      }.bind(this));
      
      $errorContainer.on("click", "button.try-again", function() {
        currentFile.status = plupload.QUEUED;
        this.uploader.start();
      }.bind(this));
      
      $errorContainer.on("click", "button.resume", function() {
        this.uploader.start();
      }.bind(this));
      
      $closeLink.on("click", function() {
        this.reset();
        return false;
      }.bind(this));
    },
    
    share: function() {
      var paths = $.map(queue, function(file) {
        return file.path;
      });
      
      if ($("#message-form").length) {
        protonet.trigger("modal_window.hide").trigger("form.attach_files", paths);
      } else {
        location.href = "/?" + $.param({ files: paths });
      }
    },
    
    reset: function() {
      if (inProgress && !confirm(confirmMessage())) {
        return;
      }
      
      this.uploader.stop();
      
      this.clearQueue();
      
      inProgress = false;
      
      $fileContainer.empty();
      
      $container.animate({
        bottom: (-$container.outerHeight()).px()
      }, 200, function() {
        $container.remove();
        $container = undef;
      });
      
      $window.off("beforeunload.file_queue");
    },
    
    clearQueue: function() {
      this.uploader.splice(0);
      queue = [];
    },
    
    toggle: function() {
      if (collapsed) {
        this.expand();
      } else {
        this.collapse();
      }
    },
    
    collapse: function() {
      $container.animate({
        bottom: (-($container.outerHeight() - $container.cssUnit("padding-bottom")[0] - $header.outerHeight())).px()
      }, 200, function() {
        collapsed = true;
      });
    },
    
    expand: function() {
      $container.animate({
        bottom: (0).px()
      }, 200, function() {
        collapsed = false;
      });
    },
    
    status: function(file) {
      var percent = this.uploader.total.percent === 100 ? 99 : this.uploader.total.percent;
      $statusContainer.html(
        protonet.t("files.hint_uploading_files", {
          percent: percent,
          count:   this.uploader.files.length,
          index:   this.uploader.files.indexOf(file) + 1
        })
      );
    }
  });
})();