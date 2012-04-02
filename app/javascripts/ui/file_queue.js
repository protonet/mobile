//= require "../utils/prettify_file_size.js"

protonet.ui.FileQueue = (function() {
  var collapsed     = true,
      queue         = {},
      lastAction    = new Date(),
      $status,
      $container,
      $list;
  
  return {
    initialize: function(config) {
      if (this.uploader) {
        return this;
      }
      
      $container  = new protonet.utils.Template("file-queue-template").to$();
      $list       = $container.find("ol");
      $status     = $container.find(".status");
      
      this.uploader = new protonet.media.Uploader(config);
      
      this._observe();
      
      return this;
    },
    
    add: function(file) {
      var $item = new protonet.utils.Template("file-queue-item-template", {
        name: file.name,
        size: protonet.utils.prettifyFileSize(file.size)
      }, true).to$();
      
      $item.appendTo($list);
      
      queue[file.id] = $item;
      
      if (collapsed) {
        this.expand();
      }
      
      return this;
    },
    
    progress: function(file) {
      queue[file.id].find(".progress").css("width", file.percent + "%");
      if (file.percent >= 100) {
        queue[file.id].addClass("done");
      }
      this.status(file);
    },
    
    status: function(file) {
      $status.text(file.name + " (" + file.percent + " %)");
    },
    
    statusDone: function() {
      $status.text(protonet.t("UPLOAD_SUCCESSFUL"));
    },
    
    remove: function() {
      
    },
    
    show: function() {
      $container.appendTo(".inner-body");
      return this;
    },
    
    hide: function() {
      $container.detach();
      return this;
    },
    
    expand: function() {
      this._animateTo(0).then(function() {
        collapsed = false;
      });
      return this;
    },
    
    collapse: function() {
      this._animateTo((-$list.outerHeight()).px()).then(function() {
        collapsed = true;
      });
      return this;
    },
    
    toggle: function() {
      collapsed ? this.expand() : this.collapse();
      return this;
    },
    
    _animateTo: function(bottom) {
      var deferred = $.Deferred();
      $container.animate({ bottom: bottom }, "fast", deferred.resolve);
      return deferred;
    },
    
    _observe: function() {
      this.uploader.bind("UploadProgress", function(uploader, file) {
        this.progress(file);
      }.bind(this));
      
      this.uploader.bind("FilesAdded", function(uploader, files) {
        this.show();
        $.each(files, function(i, file) {
          this.add(file);
        }.bind(this));
      }.bind(this));
      
      this.uploader.bind("UploadComplete", this.statusDone.bind(this));
      
      $container.on("click", ".status", this.toggle.bind(this));
      
      $container.on("click", ".file", false);
    }
  };
})();