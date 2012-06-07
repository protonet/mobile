//= require "../../utils/prettify_file_size.js"

protonet.ui.files.Queue = (function() {
  var defaultConfig = {
    path: "/users/" + protonet.config.user_id + "/",
    shareImmediate: false
  };
  
  var $container, $header, $status, $list, $close, $share, undef, collapsed, inProgress, queue;
  
  function confirmMessage() {
    return protonet.t("CONFIRM_CANCEL");
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
          this.create();
          queue = [];
          inProgress = true;
          $container.removeClass("uploaded");
          $list.empty();
          $share.hide();
        }
        
        $.each(files, function(i, file) { this.add(file); }.bind(this));
        
        if (this.config.collapsed && !inProgress) {
          this.collapse(true);
        }
      }.bind(this));
      
      this.uploader.bind("BeforeUpload", function(uploader, file) {
        this.uploading(file);
      }.bind(this));
      
      this.uploader.bind("FileUploaded", function(uploader, file, xhr) {
        this.uploaded(file, xhr);
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
      
      $container  = new protonet.utils.Template("file-queue-template").to$().appendTo("body");
      
      $header     = $container.find("h3");
      $status     = $container.find(".status");
      $list       = $container.find("ol");
      $close      = $container.find(".close");
      $share      = $container.find(".share-container");
      
      this._observe();
    },
    
    add: function(file) {
      var $item = new protonet.utils.Template("file-queue-item-template", {
        name: file.name,
        url:  protonet.data.File.getUrl(this.config.path + file.name),
        size: protonet.utils.prettifyFileSize(file.size)
      }, true).to$();
      
      $item.appendTo($list);
      
      queue[file.id] = $item;
    },
    
    scrollTo: function(file) {
      var $item = queue[file.id];
      $list.scrollTop(Math.max($item.prop("offsetTop") - $list.outerHeight() + $item.outerHeight(), 0));
    },
    
    uploading: function(file) {
      var $item = queue[file.id];
      $item.removeClass("queued").addClass("uploading");
      this.scrollTo(file);
      
      // Show confirm dialog if user leaves page before upload has finished
      $window.off("beforeunload.file_queue").on("beforeunload.file_queue", confirmMessage);
    },
    
    progress: function(file) {
      var $item = queue[file.id];
      $item.find(".loading-bar").css("width", file.percent + "%");
      $status.text(protonet.t("UPLOADING_FILES", file));
    },
    
    uploaded: function(file, xhr) {
      var response  = xhr.responseJSON,
          $item     = queue[file.id],
          data      = response[0];
      
      $item
        .data("file", data)
        .removeClass("uploading")
        .css("backgroundColor", "#ffff99")
        .animate({ "backgroundColor": "#ffffff" });
      
      $item
        .find("a").attr("href", protonet.data.File.getUrl(data.path));
    },
    
    allUploaded: function() {
      $window.off("beforeunload.file_queue");
      $container.addClass("uploaded");
      
      $status.text(protonet.t("UPLOAD_SUCCESSFUL"));
      inProgress = false;
      $share.show();
      
      if (this.config.shareImmediate) {
        this.share();
        this.collapse(this.config.collapsed);
        return;
      }
      
      if (this.config.collapsed) {
        this.collapse(true);
      } else {
        this.expand();
      }
    },
    
    _observe: function() {
      $header.on("click", this.toggle.bind(this));
      $list.on("click mousedown", ".uploading a, .queued a", false);
      
      $share.on("click", "button", function() {
        this.share();
        this.reset();
        return false;
      }.bind(this));
      
      $close.on("click", function() {
        this.reset();
        return false;
      }.bind(this));
    },
    
    share: function() {
      var paths = $.map($list.children(), function(li) {
        return $(li).data("file").path;
      });
      protonet.trigger("modal_window.hide").trigger("form.attach_files", paths);
    },
    
    reset: function() {
      if (inProgress && !confirm(confirmMessage())) {
        return;
      }
      this.uploader.stop();
      this.uploader.splice(0);
      
      inProgress = false;
      queue = [];
      
      $container.animate({
        bottom: (-$container.outerHeight()).px()
      }, "fast", function() {
        $container.remove();
        $container = undef;
      }.bind(this));
      
      $window.off("beforeunload.file_queue");
    },
    
    toggle: function() {
      if (collapsed) {
        this.expand();
      } else {
        this.collapse();
      }
    },
    
    collapse: function(immediate) {
      var duration = (immediate ? 0 : 100);
      $list.animate({ opacity: 0 }, 100);
      $container.animate({
        bottom: (-$list.outerHeight() - ($share.is(":visible") ? $share.outerHeight() : 0)).px()
      }, duration, function() {
        collapsed = true;
      }.bind(this));
    },
    
    expand: function() {
      var duration = 100;
      $list.animate({ opacity: 1 }, duration);
      $container.animate({
        bottom: 0
      }, duration, function() {
        collapsed = false;
      }.bind(this));
    }
  });
})();