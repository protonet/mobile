//= require "../resizer.js"

protonet.ui.files.Widget = {
  initialize: function() {
    this.$widget = $("#file-widget");
    if (!this.$widget.length) {
      return;
    }
    
    this.filePaths  = {};
    
    this.$dropArea  = $("#file-widget-drop-area");
    this.$dropText  = this.$dropArea.find("span");
    this.$list      = this.$widget.find("ul");
    this.$resizer   = this.$widget.find(".resize");
    this.$showAll   = this.$widget.find(".show-all");
    this.$count     = this.$widget.find("output.count");
    
    new protonet.ui.Resizer(this.$list, this.$resizer, { storageKey: "file_widget_height_v2" });
    
    this._initDragAndDrop();
    this._observe();
  },
  
  reset: function() {
    this.$list.empty().css("visibility", "hidden");
    this.$dropArea.hide();
    this.$count.empty();
  },
  
  _initDragAndDrop: function() {
    if (protonet.data.User.isStranger(protonet.config.user_id)) {
      return;
    }
    
    this.$widget.addClass("upload-allowed");
    
    this.queue = new protonet.ui.files.Queue({
      browse_button:  this.$dropArea.attr("id"),
      drop_element:   this.$widget.attr("id"),
      zIndex:         9
    });
    
    this.uploader = this.queue.uploader;
    
    if (this.uploader.features.dragdrop) {
      this.$widget.addClass("supports-drag-and-drop");
      this.$dropText.text(protonet.t("files.hint_drag_and_drop_here"));
    } else {
      this.$dropText.text(protonet.t("files.link_upload"));
    }
  },
  
  _observe: function() {
    this.$list.on("click", "a.file, a.folder", function(event) {
      event.preventDefault();
    });
    
    this.$list.on("click", "li:not(.disabled)", function(event) {
      var $target = $(event.currentTarget);
      protonet.open($target.find("a").attr("href"));
    });
    
    this.$list.on("dragstart", "li:not(.disabled)", function(event) {
      var $target = $(event.currentTarget);
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "copyMove";
        event.dataTransfer.setData("URL", $target.find("a").attr("href"));
        event.dataTransfer.setData("Text", $target.find("a").attr("href"));
      }
    });
    
    protonet.on("channel.change", function(id) {
      this.currentChannelId = id;
      if (this.uploader) {
        this.uploader.setBasePath(protonet.data.Channel.getFolder(id));
      }
      
      if (protonet.data.Channel.isGlobal(id)) {
        this.$widget.hide();
        return;
      }
      
      this.$showAll.attr("href", protonet.data.Channel.getFolderUrl(id));
      this.$widget.show().addClass("loading");
      this.reset();
      
      protonet.dispatcher.onready(this.getFiles.bind(this));
    }.bind(this));
    
    protonet.on("channel.update_files", function(data, avoidHighlight) {
      var channelId = data.id;
      
      if (this.currentChannelId !== channelId) {
        return;
      }
      
      this.reset();
      
      var oldFilePaths = this.filePaths[channelId],
          newFilePaths = [];
      
      if (data.files.length) {
        $.each(data.files, function(i, file) {
          var $element = this.createElement(file);
          this.$list.append($element);
          protonet.trigger("file.rendered", $element);

          if (!avoidHighlight && i === 0 && oldFilePaths && oldFilePaths.indexOf(file.path) === -1) {
            this.highlight($element);
          }

          newFilePaths.push(file.path);
        }.bind(this));
        this.$count.text("(" + data.files.length + "/" + data.total + ")");
        this.$list.css("visibility", "");
      } else {
        this.$dropArea.show();
      }
      
      this.filePaths[channelId] = newFilePaths;
      this.$showAll.css("display", "inline-block");
      
      // IE needs this
      if (this.uploader) {
        setTimeout(function() {
          this.uploader.trigger("Refresh");
        }.bind(this), 0);
      }
    }.bind(this));
    
    protonet.on("socket.reconnected", this.getFiles.bind(this));
  },
  
  createElement: function(file) {
    var modified    = new Date(file.modified),
        $item       = $("<li>",   { draggable: true, title: file.name }),
        $anchor     = $("<a>",    { text: file.name, href: protonet.data.File.getUrl(file.path), "class": "file", draggable: false }),
        $lineBreak  = $("<br>"),
        $modified   = $("<span>", { text: modified, title: modified, "class": "file-modified" });
    $lineBreak.appendTo($anchor);
    $modified.appendTo($anchor);
    $anchor.appendTo($item);
    return $item;
  },
  
  highlight: function($element) {
    $element
      .stop(true, true)
      .css("backgroundColor", "#ffff99")
      .animate({ "backgroundColor": "#ecf1fe" }, 1000, function() {
        $element.css("backgroundColor", "");
      });
  },
  
  getFiles: function() {
    protonet.dispatcher.onready(function() {
      if (this.currentRequest) {
        this.currentRequest.abort();
      }
      
      this.currentRequest = protonet.data.File.getLastModified(protonet.data.Channel.getFolder(this.currentChannelId), {
        success: function(data) {
          $.extend(data, { id: this.currentChannelId });
          protonet.trigger("channel.update_files", data, true);
        }.bind(this),

        error:   function() {
          // TODO: proper error handling
          protonet.trigger("channel.update_files", { id: this.currentChannelId, files: [] }, true);
        }.bind(this),

        complete: function() {
          this.$widget.removeClass("loading");
        }.bind(this)
      });
    }.bind(this));
  }
};