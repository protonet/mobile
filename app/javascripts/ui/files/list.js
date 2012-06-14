//= require "../../utils/parse_url.js"
//= require "../../utils/parse_query_string.js"
//= require "../../effects/blink.js"
//= require "file.js"
//= require "details.js"

protonet.ui.files.List = (function() {
  var viewer              = protonet.config.user_id,
      node                = protonet.config.node_uuid,
      KEY_BACKSPACE       = 8,
      KEY_TAB             = 9,
      KEY_ENTER           = 13,
      KEY_UP              = 38,
      KEY_DOWN            = 40,
      KEY_DELETE          = 46,
      REG_EXP_CHANNELS    = /^\/channels\/(\d+)\/$/,
      REG_EXP_USERS       = /^\/users\/(\d+)\/$/,
      defaultErrorMapping = {
        "Rpc::AuthError": "FILE_AUTH_ERROR",
        "TimeoutError":   "FILE_TIMEOUT_ERROR",
        "*":              "FILE_UNKNOWN_ERROR"
      };
  
  function _sortByName(arr) {
    arr.sort(function(a, b) {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();
      if (a > b) { return 1;  }
      if (a < b) { return -1; }
      return 0;
    });
  }
  
  function sortByName(arr) {
    var current,
        folders           = [],
        rendezvousFolders = [],
        files             = [],
        i                 = 0,
        length            = arr.length;
    
    for (; i<length; i++) {
      current = arr[i];
      if (current.type === "folder") {
        current.rendezvousFolder ? rendezvousFolders.push(current) : folders.push(current);
      } else {
        files.push(current);
      }
    }
    
    _sortByName(folders);
    _sortByName(rendezvousFolders);
    _sortByName(files);
    
    return folders.concat(rendezvousFolders).concat(files);
  }
  
  function stringifyDataTransfer(files) {
    return JSON.stringify({
      node:   node,
      files:  files
    });
  }
  
  function parseDataTransfer(str) {
    var obj = JSON.parse($.trim(str));
    if (obj.node === node) {
      return obj.files;
    }
  }
  
  function createUriList(files) {
    str = "";
    $.each(files, function(i, file) {
      str += protonet.data.File.getUrl(file.path) + "\r\n";
    });
    return $.trim(str);
  }
  
  
  
  
  // ------------------------------ CLASS ------------------------------ \\
  return Class.create({
    initialize: function($page) {
      this.$container     = $page.data("file_list", this);
      this.$content       = this.$container.find(".content");
      this.$fileList      = this.$container.find(".file-list");
      this.$fileDetails   = this.$container.find(".file-details");
      this.$fileActions   = this.$container.find(".file-actions");
      this.$addressBar    = this.$container.find(".address-bar");
      this.$tableWrapper  = this.$container.find(".table-wrapper");
      this.$tbody         = this.$fileList.find("tbody");
      
      this.currentPath    = $.trim(this.$addressBar.text()) || "/";
      
      this._initHistory();
      this._initUploader();
      this._initDragAndDrop();
      this._initMarker();
      this._initActions();
      
      this.resize();
      
      this._observe();
      
      protonet.dispatcher.onready(function() {
        this.open(this.currentPath);
      }.bind(this));
    },
    
    /**
     * Go to the given path (no matter if path is file or folder)
     */
    open: function(path) {
      path = path || "/";
      
      if (this.currentRequest) {
        this.currentRequest.abort();
      }
      if (protonet.data.File.isFolder(path)) {
        this.currentRequest = protonet.data.File.list(path, {
          success: function(files) {
            this.renderList(files);
          }.bind(this),
          error:   function(error) {
            this.$tbody.children().each(function() {
              var $file = $(this);
              if ($file.data("folder-path") === path) {
                $file.removeClass("loading");
              }
            });
            
            path = this.currentPath || path;
            
            this.error({
              "Rpc::ReadAccessDeniedError": "FILE_LIST_READ_ACCESS_DENIED_ERROR"
            }, error);
          }.bind(this),
          complete: function() {
            this.updatePath(path);
          }.bind(this)
        });
      } else {
        this.currentRequest = protonet.data.File.get(path, {
          success: function(file) {
            this.renderDetails(file);
          }.bind(this),
          error:   function(error) {
            this.$tbody.children().each(function() {
              var $file = $(this);
              if ($file.data("file-path") === path) {
                $file.removeClass("loading");
              }
            });

            path = this.currentPath || path;

            this.error({
              "Rpc::ReadAccessDeniedError": "FILE_INFO_READ_ACCESS_DENIED_ERROR"
            }, error);
          }.bind(this),
          complete: function() {
            this.updatePath(path);
          }.bind(this)
        });
      }
    },
    
    error: function(errorMapping, error) {
      errorMapping = $.extend({}, defaultErrorMapping, errorMapping);
      var translationResource = errorMapping[error] || errorMapping["*"];
      protonet.trigger("flash_message.error", protonet.t(translationResource));
    },
    
    insertEmptyFolderHint: function() {
      var hint = protonet.t("FOLDER_EMPTY");
      if (this.uploader && this.uploader.features.dragdrop) {
        hint += " " + protonet.t("DRAG_AND_DROP_HERE");
      }
      this.insertHint(hint);
    },
    
    /**
     * Render an info message
     */
    insertHint: function(text) {
      this.removeHint();
      $("<p>", { "class": "hint", html: text }).appendTo(this.$tableWrapper);
    },
    
    /**
     * Remove all info messages
     */
    removeHint: function() {
      this.$tableWrapper.find("p.hint").remove();
    },
    
    /**
     * Reset the file page
     */
    reset: function() {
      this.mark($());
      this.$fileList.hide();
      this.$fileDetails.empty().hide();
      this.$tbody.empty();
      this.$tableWrapper.scrollTop(0);
      this.$fileList.attr("draggable", "false");
      this.removeHint();
      
      if (this.uploader.features.dragdrop) {
        protonet.ui.Droppables.remove(this.droppables.desktopFile);
        protonet.ui.Droppables.remove(this.droppables.protonetFile);
      }
    },
    
    updatePath: function(path) {
      this.currentPath = path;
      this._updateActions();
      this._updateAddressBar();
      this.uploader.setTargetFolder(path);
      protonet.utils.History.push(protonet.data.File.getUrl(path));
    },
    
    /**
     * Render the file list
     */
    renderList: function(files) {
      this.reset();
      this.$fileList.show().attr("draggable", "true");
      
      if (this.uploader.features.dragdrop) {
        protonet.ui.Droppables.add(this.droppables.desktopFile);
        protonet.ui.Droppables.add(this.droppables.protonetFile);
      }
      
      if (!files) {
        this.insertHint("This folder doesn't seem to exist anymore");
        return;
      }
      
      if (!files.length) {
        this.insertEmptyFolderHint();
        return;
      }
      
      files = sortByName(files);
      $.each(files, function(i, file) {
        new protonet.ui.files.File(file, this).renderInto(this.$tbody);
      }.bind(this));
    },
    
    /**
     * Render the file details page
     */
    renderDetails: function(file) {
      this.reset();
      this.$fileDetails.show();
      
      if (file.type === "missing") {
        this.insertHint("This file doesn't seem to exist anymore");
        return;
      }
      
      new protonet.ui.files.Details(file, this).renderInto(this.$fileDetails);
      this.mark(this.$fileDetails);
    },
    
    /**
     * Delete the currently marked elements
     */
    remove: function() {
      var $wrapper = $("<div>", { "class": "mini-table-wrapper" }),
          $table   = $("<table>", { "class": "file-list mini" }),
          $items   = $();
      
      this.$marked.each(function(i, element) {
        var data     = new $(element).data("instance").data,
            $element = new protonet.ui.files.File(data, this).$element.clone();
        $items = $items.add($element);
      });
      
      $table.append($items).click(false);
      $wrapper.html($table);
      
      new protonet.ui.Confirm({
        text:     protonet.t("CONFIRM_FILE_DELETION"),
        content:  $wrapper
      }).done(function() {
        this._disableMarked();
        
        protonet.data.File.remove(this.markedPaths, {
          success: function(paths) {
            protonet.trigger("flash_message.notice", protonet.t("REMOVING_FILES_SUCCESS"));
            
            this._enableMarked();
            
            this.$marked.each(function(i, item) {
              var $item    = $(item),
                  instance = $item.data("instance"),
                  itemPath = instance.data.path;
              
              if (paths.indexOf(itemPath) !== -1) {
                if (this.$tbody.children().length <= paths.length && this.$fileList.is(":visible")) {
                  this.insertEmptyFolderHint();
                }
                instance.remove();
                this.mark($());
              }
            }.bind(this));
          }.bind(this),
          error: function(error) {
            this._enableMarked();
            
            this.error({
              "Rpc::WriteAccessDeniedError": "FILE_DELETE_DENIED_ERROR"
            }, error);
          }.bind(this)
        });
      }.bind(this));
    },
    
    /**
     * Share the currently marked elements
     */
    share: function() {
      if (protonet.ui.ModalWindow.isVisible()) {
        protonet.trigger("modal_window.hide").trigger("form.attach_files", this.markedPaths);
      } else {
        location.href = protonet.config.base_url + "/?" + $.param({ files: this.markedPaths });
      }
    },
    
    /**
     * Create a new folder and let the user choose a name
     */
    newFolder: function() {
      var now       = new Date(),
          name      = protonet.t("UNTITLED_FOLDER"),
          i         = 1;
      
      // Make sure that the folder name doesn't exist already
      while (this.getFolder(name + " " + i)) {
        i++;
      }
      
      name += " " + i;
      
      protonet.data.File.newFolder(this.currentPath + name + "/");
      
      var folder = new protonet.ui.files.File({
        type:     "folder",
        name:     name,
        path:     this.currentPath + name + "/",
        modified: now
      }, this);
      
      this.insert(folder);
      folder.rename();
    },
    
    /**
     * Ensure that the file list takes all available space
     */
    resize: function() {
      var currentHeight = this.$tableWrapper.outerHeight(),
          newHeight     = this.$container.outerHeight() - this.$tableWrapper.prop("offsetTop") - 21;
      this.$tableWrapper.css("height", newHeight.px());
    },
    
    /**
     * Scroll to the given element
     */
    scrollTo: function($element, up) {
      // Scroll to the very top when the element is the first row
      if ($element.is(":first-child")) {
        this.$tableWrapper.prop("scrollTop", 0);
        return;
      // scroll to the very bottom when the element is the last row
      } else if ($element.is(":last-child")) {
        this.$tableWrapper.prop("scrollTop", this.$tableWrapper.prop("scrollHeight"));
        return;
      }
      
      var $input    = $('<input style="width:0; height:0; position:absolute; border:0;">'),
          $sibling  = up ? $element.prev() : $element.next();
      
      $sibling.children().first().append($input);
      $input.focus().remove();
    },
    
    highlight: function($elements) {
      $elements.each(function(i) {
        var $element                = $elements.eq(i),
            originalBackgroundColor = $element.css("background-color");
        
        $element
          .css({ "background-color": "#ffff99" })
          .animate({ "background-color": originalBackgroundColor }, 1000, function() {
            $element.css({ "background-color": "" });
          });
      });
    },
    
    /**
     * Select/mark the given element(s)
     */
    mark: function($elements) {
      this.$marked.removeClass("focus");
      this.$marked = $elements.not(".disabled");
      this.$marked.addClass("focus");
      
      this.markedFiles = $.map($elements, function(element) {
        return $(element).data("instance");
      });
      
      this.markedPaths = $.map(this.markedFiles, function(file) {
        return file.data.path;
      });
      
      this._updateActions();
    },
    
    /**
     * Move files to a folder
     */
    move: function(filesData, toFolder) {
      var oldFiles = $.map(filesData, function(data) {
        return this.getFile(data.path) || this.getFolder(data.path) || null;
      }.bind(this));
      
      $.each(oldFiles, function(i, file) {
        file.disable();
      });
      
      if (toFolder === this.currentPath) {
        var newFiles = $.map(filesData, function(data) {
          var newPath = toFolder + data.name + (data.type === "folder" ? "/" : ""),
              newData = $.extend({}, data, { path: newPath }),
              newFile = new protonet.ui.files.File(newData, this);
          newFile.disable();
          this.insert(newFile);
          return newFile;
        }.bind(this));
      }
      
      var paths = $.map(filesData, function(data) {
        return data.path;
      });
      
      protonet.data.File.move(paths, toFolder, {
        success: function() {
          var $elements  = $(),
              folderName = protonet.data.File.getName(toFolder);
          
          if (oldFiles.length > 1) {
            protonet.trigger("flash_message.notice", protonet.t("MOVING_FILES_SUCCESS", {
              name: folderName
            }));
          } else {
            protonet.trigger("flash_message.notice", protonet.t("MOVING_FILE_SUCCESS", {
              name: folderName
            }));
          }  
          
          $.each(oldFiles, function(i, file) {
            file.destroy();
          });
          
          $.each(newFiles || [], function(i, file) {
            $elements = $elements.add(file.$element);
            file.enable();
          });
          
          this.highlight($elements);
        }.bind(this),
        error: function(error) {
          this.error({
            "Rpc::WriteAccessDeniedError": "FILE_MOVE_WRITE_DENIED_ERROR",
            "Rpc::ReadAccessDeniedError":  "FILE_MOVE_READ_DENIED_ERROR"
          }, error);
          
          $.each(newFiles || [], function(i, file) {
            file.destroy();
          });
          
          $.each(oldFiles, function(i, file) {
            file.enable();
          });
        }.bind(this),
        complete: function() {
          if (!this.$tbody.children().length && this.$fileList.is(":visible")) {
            this.insertEmptyFolderHint();
          }
        }.bind(this)
      });
    },
    
    /**
     * Get folder data by name or path
     */
    getFolder: function(nameOrPath) {
      var folder,
          $folders = this.$tbody.find("tr[data-folder-path]"),
          i        = 0;
      for (; i<$folders.length; i++) {
        folder = $folders.eq(i).data("instance");
        if (folder.data.name === nameOrPath || folder.data.path === nameOrPath) {
          return folder;
        }
      }
    },
    
    /**
     * Get file data by name or path
     */
    getFile: function(nameOrPath) {
      var file,
          $files = this.$tbody.find("tr[data-file-path]"),
          i      = 0;
      for (; i<$files.length; i++) {
        file = $files.eq(i).data("instance");
        if (file.data.name === nameOrPath || file.data.path === nameOrPath) {
          return file;
        }
      }
    },
    
    /**
     * Inserts a file at the top and scrolls to it
     */
    insert: function(file) {
      this.removeHint();
      
      var $firstFile  = this.$fileList.find("[data-file-path]:first"),
          $lastFolder = this.$fileList.find("[data-folder-path]:last");
      
      if ($firstFile.length) {
        file.$element.insertBefore($firstFile);
      } else if ($lastFolder.length) {
        file.$element.insertAfter($lastFolder);
      } else {
        file.$element.appendTo(this.$tbody);
      }
      
      this.scrollTo(file.$element);
    },
    
    /**
     * Play the selected files
     */
    play: function() {
      var urls = $.map(this.markedPaths, function(path) {
        return protonet.data.File.getDownloadUrl(path);
      });
      
      if (window.__audioPopup && !window.__audioPopup.closed) {
        window.__audioPopup.protonet.trigger("audio.add", urls);
        window.__audioPopup.focus();
      } else {
        var params = $.param({ urls: urls });
        window.__audioPopup = open("/files/play?" + params, "player" + node, "width=320,height=355,menubar=no,location=no,resizable=no,scrollbars=yes,status=no");
        if (window.__audioPopup) {
          this._updateActions();
          var audioPlayer = this.$fileDetails.find(".embed").data("audio_player");
          audioPlayer && audioPlayer.stop();
        }
      }
    },
    
    
    
    
    
    
    // --------------------------------------- PRIVATE --------------------------------------- \\
    _updateAddressBar: function() {
      var path              = "/",
          viewerFolderPath  = protonet.data.User.getFolder(viewer),
          isFolderPath      = protonet.data.File.isFolder(this.currentPath),
          pathParts         = this.currentPath.split("/"),
          $path             = this._getAddressBarItem("Files", "/");
      
      $.each(pathParts, function(i, part) {
        if (!part) { return; }
        
        path += part;
        
        // Don't add a slash at the end of file paths
        if (pathParts[i + 1] || isFolderPath) {
          path += "/";
        }
        
        if (path === "/users/" && this.currentPath.startsWith(viewerFolderPath)) {
          return;
        }
        
        $path = $path.add(this._getAddressBarItem(part, path));
      }.bind(this));
      
      this.$addressBar.html($path);
    },
    
    _updateActions: function() {
      var hasWriteAccess = protonet.data.User.hasWriteAccessToFile(viewer, this.currentPath),
          canRemove      = hasWriteAccess && this.currentPath !== "/";
      
      this.uploader.disableBrowse();
      this.$fileActions.find("a").removeClass("enabled");
      
      if (this.$fileList.is(":visible")) {
        if (hasWriteAccess) {
          this.uploader.enableBrowse();
          this.$fileActions.find(".new-document, .new-folder, .upload").addClass("enabled");
        }
      }
      
      if (this.$marked.length) {
        this.$fileActions.find(".share").addClass("enabled");
        if (canRemove) {
          this.$fileActions.find(".remove").addClass("enabled");
        }
      }
      
      if (this.markedPaths.length > 0) {
        var allAudio = true;
        for (var i=0; i<this.markedPaths.length; i++) {
          if (!protonet.media.Audio.canPlay(this.markedPaths[i])) {
            allAudio = false;
          }
        }
        
        if (allAudio) {
          this.$fileActions.find(".play").addClass("enabled");
        }
      }
      
      if (window.__audioPopup && !window.__audioPopup.closed) {
        this.$fileActions.find(".play").addClass("add");
      } else {
        this.$fileActions.find(".play").removeClass("add");
      }
    },
    
    _getAddressBarItem: function(name, path) {
      var isFolder = protonet.data.File.isFolder(path),
          $element = $("<a>", { text: name });
      
      if (isFolder) {
        // FIXME: Potential security flaw when using html() here
        $element
          .attr("data-folder-path", path)
          .html(protonet.data.File.getName(path));
      } else {
        $element.attr("data-file-path", path);
      }
      
      return $element;
    },
    
    _initUploader: function() {
      this.fileQueue = new protonet.ui.files.Queue({
        drop_element:  "plupload-drop-element",
        browse_button: "plupload-browse-button",
        collapsed:     true
      });
      
      this.uploader = this.fileQueue.uploader;
      
      this.uploader.bind("FilesAdded", function(uploader, files) {
        if (uploader.getTargetFolder() !== this.currentPath) {
          return;
        }
        
        var now = new Date();
        
        $.each(files, function(i, data) {
          var $existingFile = this.getFile(data.name);
          if ($existingFile) {
            $existingFile.data("instance").destroy();
          }
          
          var file = new protonet.ui.files.File({
            type:     "file",
            name:     data.name,
            size:     data.size,
            modified: now,
            path:     this.currentPath + data.name
          }, this);
          
          file.disable();
          file.progress(0);
          file.setId(data.id);
          
          this.insert(file);
        }.bind(this));
      }.bind(this));
      
      this.uploader.bind("UploadProgress", function(uploader, file) {
        var $element  = $("#" + file.id),
            percent   = file.percent;
        
        if (!$element.length) {
          return;
        }
        
        // Don't show file as "finished" until it's really finished (file has to be moved in the backend from /tmp/ folder to actual target folder)
        if (percent === 100) {
          percent = 99;
        }
        
        $element.data("instance").progress(percent);
      }.bind(this));
      
      this.uploader.bind("FileUploaded", function(uploader, file, xhr) {
        var $element  = $("#" + file.id),
            data      = xhr.responseJSON[0],
            newFile,
            oldFile;
        
        if (!$element.length) {
          return;
        }
        
        newFile = new protonet.ui.files.File(data, this);
        oldFile = $("#" + file.id).data("instance");
        
        oldFile.$element.replaceWith(newFile.$element);
        oldFile.destroy();
        
        this.highlight(newFile.$element);
      }.bind(this));
      
      this.uploader.disableBrowse();
    },
    
    _initDragAndDrop: function() {
      if (!this.uploader.features.dragdrop) { return; }
      
      this.draggedPaths  = [];
      
      this.droppables    = {
        desktopFile: {
          types:      "files",
          elements:   ".table-wrapper",
          condition:  function() {
            return protonet.data.User.hasWriteAccessToFile(viewer, this.currentPath);
          }.bind(this)
        },
        
        protonetFile: {
          types:      protonet.FILES_MIME_TYPE,
          elements:   ".table-wrapper",
          className:  "dragover-protonet-files",
          indicator:  "dragover-possible-protonet-files",
          condition:  function($element) {
            if (this.draggedPaths.length && protonet.data.File.getFolder(this.draggedPaths[0]) === this.currentPath) {
              return false;
            }
            if (!protonet.data.User.hasWriteAccessToFile(viewer, this.currentPath)) {
              return false;
            }
            return true;
          }.bind(this),
          ondrop: function($element, event) {
            event.preventDefault();
            
            var rawData   = event.dataTransfer.getData(protonet.FILES_MIME_TYPE);
            if (!rawData) {
              return;
            }
            
            var filesData = parseDataTransfer(rawData);
            if (!filesData) {
              protonet.trigger("flash_message.error", protonet.t("MOVE_FILES_BETWEEN_NODES_ERROR"));
              return;
            }
            
            this.move(filesData, this.currentPath);
          }.bind(this)
        },
        
        desktopFileOnFolder: {
          types:        "files",
          elements:     ".files-page [data-folder-path]",
          ondragenter:  function($element) {
            this.blinker = protonet.effects.blink($element, {
              delay:    (0.4).seconds(),
              interval: (0.2).seconds(),
              callback: function() { $element.click().dblclick(); }
            });
          }.bind(this),
          ondragleave:  function($element) {
            this.blinker.stop();
          }.bind(this),
          ondrop: function($element, event) {
            event.preventDefault();
            
            if (protonet.data.User.hasWriteAccessToFile(viewer, this.currentPath)) {
              this.uploader.setTargetFolder($element.data("folder-path"));
            } else {
              protonet.trigger("flash_message.error", protonet.t("FILE_MOVE_WRITE_DENIED_ERROR"));
              event.stopPropagation();
            }
          }.bind(this)
        },
        
        protonetFileOnFolder: {
          types:      protonet.FILES_MIME_TYPE,
          elements:   ".files-page [data-folder-path]",
          condition:  function($element) {
            // don't highlight when the item being dragged is the droppable (you cannot move a folder into itself)
            return this.draggedPaths.indexOf($element.data("folder-path")) === -1;
          }.bind(this),
          ondragenter:  function($element) {
            this.blinker = protonet.effects.blink($element, {
              delay:    (0.4).seconds(),
              interval: (0.2).seconds(),
              callback: function() { $element.click().dblclick(); }
            });
          }.bind(this),
          ondragleave:  function($element) {
            this.blinker.stop();
          }.bind(this),
          ondrop:       function($element, event) {
            event.preventDefault();
            
            var rawData   = event.dataTransfer.getData(protonet.FILES_MIME_TYPE);
            if (!rawData) {
              return;
            }
            
            var filesData = parseDataTransfer(rawData);
            if (!filesData) {
              protonet.trigger("flash_message.error", protonet.t("MOVE_FILES_BETWEEN_NODES_ERROR"));
              return;
            }
            
            this.move(filesData, $element.data("folder-path"));
          }.bind(this)
        }
      };
      
      protonet.ui.Droppables.add(this.droppables.desktopFileOnFolder);
      protonet.ui.Droppables.add(this.droppables.protonetFileOnFolder);
      
      this.$container.bind("dragstart", this._dragstart.bind(this));
      
      // Make sure that the file list scrolls while something is dragged 
      var offset = this.$tableWrapper.offset();
      this.$tableWrapper.bind("dragover", function(event) {
          var elementHeight = this.$tableWrapper.outerHeight(),
              scrollTop     = $window.scrollTop(),
              elementTop    = offset.top - scrollTop,
              mouseTop      = event.originalEvent.pageY - scrollTop;
        
        if (mouseTop < (elementTop + 5)) {
          this.$tableWrapper.scrollTop(this.$tableWrapper.scrollTop() - 22);
          return;
        }
        
        if (mouseTop < (elementTop + 10)) {
          this.$tableWrapper.scrollTop(this.$tableWrapper.scrollTop() - 10);
          return;
        }
        
        if (mouseTop < (elementTop + 20)) {
          this.$tableWrapper.scrollTop(this.$tableWrapper.scrollTop() - 2);
          return;
        }
        
        if (mouseTop > (elementTop + elementHeight - 5)) {
          this.$tableWrapper.scrollTop(this.$tableWrapper.scrollTop() + 22);
          return;
        }
        
        if (mouseTop > (elementTop + elementHeight - 10)) {
          this.$tableWrapper.scrollTop(this.$tableWrapper.scrollTop() + 10);
          return;
        }
        
        if (mouseTop > (elementTop + elementHeight - 20)) {
          this.$tableWrapper.scrollTop(this.$tableWrapper.scrollTop() + 2);
          return;
        }
      }.bind(this));
    },
    
    _getDragImage: function() {
      var $table = $("<table>", { "class": "file-list mini" });
      $table.append(this.$marked.clone());
      return $table;
    },
    
    _dragstart: function(event) {
      var dataTransfer  = event.dataTransfer;
      if (!dataTransfer || !this.$marked.length) {
        event.preventDefault();
        return;
      }
      
      var $dragImage = this._getDragImage().insertAfter(this.$tableWrapper);
      
      this.draggedPaths = this.markedPaths;
      
      var dragData = $.map(this.$marked, function(element) {
        return $(element).data("instance").data;
      });
      
      var uriList = createUriList(dragData);
      // dataTransfer.setData("DownloadURL", protonet.data.File.getDownloadUrl(this.draggedPaths[0]));
      dataTransfer.setData("text/uri-list", uriList);
      dataTransfer.setData("text/plain", uriList);
      dataTransfer.setData(protonet.FILES_MIME_TYPE, stringifyDataTransfer(dragData));
      dataTransfer.effectAllowed = "copyMove";
      dataTransfer.setDragImage($dragImage[0], 10, 10);
      
      // Timeout is necessary for webkit to capture a snapshot of the element
      setTimeout(function() { $dragImage.remove(); }, 0);
    },
    
    _initHistory: function() {
      this.historyHook = this._historyChange.bind(this);
      protonet.utils.History.addHook(this.historyHook);
    },
    
    _historyChange: function(url) {
      var parsedUrl     = protonet.utils.parseUrl(url),
          urlParameters = protonet.utils.parseQueryString(url);
      
      if (!parsedUrl.path.startsWith("/files")) {
        return false;
      }
      
      this.open(urlParameters.path);
      return true;
    },
    
    _initActions: function() {
      this.$fileActions.on("mousedown", "a", function(event) {
        event.stopPropagation();
      });
      
      this.$fileActions.on("click", ".enabled.share", "click", function(event) {
        this.share();
        event.preventDefault();
      }.bind(this));
      
      this.$fileActions.on("click", ".enabled.remove", function(event) {
        this.remove();
        event.preventDefault();
      }.bind(this));
      
      this.$fileActions.on("click", ".enabled.new-folder", function(event) {
        this.newFolder();
        event.preventDefault();
      }.bind(this));
      
      this.$fileActions.on("click", ".enabled.play", function(event) {
        this.play();
        event.preventDefault();
      }.bind(this));
    },
    
    _initMarker: function() {
      this.$marked = $();
      this.markedPaths = [];
      this.markedFiles = [];
      
      this.$tbody.on("mousedown", "tr", this._markerMousedown.bind(this));
      
      $document.on({
        "keydown.files_page":   function(event) {
          this._markerKeydown(event);
        }.bind(this),
        "mousedown.files_page": function(event) {
          if (!this._isOnScrollBar(event)) {
            this._clearMarker()
          }
        }.bind(this)
      });
    },
    
    _disableMarked: function() {
      this.$marked.each(function() {
        $(this).data("instance").disable();
      });
    },
    
    _enableMarked: function() {
      this.$marked.each(function() {
        $(this).data("instance").enable();
      });
    },
    
    _isOnScrollBar: function(event) {
      var scrollBarWidth = 20;
      if (!this.$tableWrapper.is(event.target)) {
        return false;
      }
      
      if (this.$tableWrapper.prop("scrollHeight") <= this.$wrapper.prop("offsetTop")) {
        return false;
      }
      
      if (event.offsetX < (this.$tableWrapper.outerWidth() - scrollBarWidth)) {
        return false;
      }
      
      return true;
    },
    
    _clearMarker: function() {
      if (this.$fileDetails.is(":visible")) {
        return;
      }
      
      this.mark($());
    },
    
    _markerKeydown: function(event) {
      if (this.$fileDetails.is(":visible")) {
        return;
      }
      
      this.typedCharacters = this.typedCharacters || "";
      
      var preventDefault,
          shiftKey        = event.shiftKey,
          altKey          = event.altKey,
          ctrlKey         = event.ctrlKey && !altKey,
          metaKey         = event.metaKey,
          keyCode         = event.keyCode,
          $newMarked      = $();
      
      if (keyCode === KEY_TAB) {
        keyCode = shiftKey ? KEY_UP : KEY_DOWN;
        shiftKey = false;
      }
      
      switch(keyCode) {
        case KEY_ENTER:
          if (this.$marked.length === 1) {
            preventDefault = true;
            this.$marked.trigger("dblclick");
          }
          break;
        case KEY_BACKSPACE:
          if (!ctrlKey && !metaKey) {
            break;
          }
        case KEY_DELETE:
          $newMarked = this.$marked;
          this.$fileActions.find(".remove").click();
          break;
        case KEY_UP:
          var $first = this.$marked.first(),
              $prev  = $first.prev();
          if ($first.length && $prev.length) {
            if (shiftKey) {
              $newMarked = this.$marked.add($prev);
            } else {
              $newMarked = $prev;
            }
          } else {
            if (shiftKey) {
              $newMarked = this.$marked;
            } else {
              $newMarked = $first;
            }
          }
          
          this.scrollTo($newMarked.first(), true);
          preventDefault = true;
          break;
        case KEY_DOWN:
          var $last = this.$marked.last(),
              $next = $last.next();
          if ($last.length && $next.length) {
            if (shiftKey) {
              $newMarked = this.$marked.add($next);
            } else {
              $newMarked = $next;
            }
          } else {
            if ($last.length) {
              if (shiftKey) {
                $newMarked = this.$marked;
              } else {
                $newMarked = $last;
              }
            } else {
              // select first
              $newMarked = this.$tbody.children().first();
            }
          }
          
          this.scrollTo($newMarked.last(), false);
          preventDefault = true;
          break;
        default:
          if (metaKey || ctrlKey || altKey) {
            $newMarked = this.$marked;
            break;
          }
          
          var character = String.fromCharCode(keyCode).toLowerCase();
          if (character.match(/[\w\_\-\.]/)) {
            clearTimeout(this.keydownTimeout);
            this.keydownTimeout = setTimeout(function() { this.typedCharacters = ""; }.bind(this), 1000);
            this.typedCharacters += character;
            var $rows   = this.$tbody.children(),
                i       = 0,
                length  = $rows.length,
                $row;
            
            for (; i<length; i++) {
              $row = $rows.eq(i);
              if ($row.data("instance").data.name.toLowerCase().startsWith(this.typedCharacters)) {
                $newMarked = $row;
                this.scrollTo($row);
                break;
              }
            }
          } else {
            $newMarked = this.$marked;
          }
      }
      
      this.mark($newMarked);
      if (preventDefault) {
        event.preventDefault();
      }
    },
    
    _markerMousedown: function(event) {
      if (this.$fileDetails.is(":visible")) {
        return;
      }
      
      var $current        = $(event.currentTarget),
          ctrlKey         = event.ctrlKey && !event.altKey,
          metaKey         = event.metaKey,
          shiftKey        = event.shiftKey,
          $oldMarked      = this.$marked,
          $newMarked      = $(),
          alreadyFocused  = $current.hasClass("focus");
      
      if (!alreadyFocused) {
        // This "mousedown-focus" class is required for making files renameable
        // after the second click
        $current.addClass("disable-rename");
        $current.one("click", function() {
          setTimeout(function() { $current.removeClass("disable-rename"); }, 500);
        });
      }
      
      if (ctrlKey || metaKey) {
        if (alreadyFocused) {
          $newMarked = $oldMarked.not($current);
        } else {
          $newMarked = $oldMarked.add($current);
        }
      } else if (shiftKey && $oldMarked.length) {
        var $last = $oldMarked.last();
        if ($last.index() < $current.index()) {
          $newMarked = $oldMarked.add($last.nextUntil($current.next()));
        } else if ($last.index() > $current.index()) {
          $newMarked = $oldMarked.add($last.prevUntil($current.prev()));
        }
      } else if (alreadyFocused) {
        $newMarked = $oldMarked;
      } else {
        $newMarked = $current;
      }
      
      this.mark($newMarked);
      
      event.stopPropagation();
    },
    
    _observe: function() {
      var renameTimeout,
          isInModalWindow = $(".modal-window").length > 0;
      
      this.$container.on("click", ".file, .folder", function(event) {
        event.preventDefault();
      });
      
      this.$container.on("click", "tbody tr.focus", function(event) {
        var $element = $(event.currentTarget);
        if (!$element.hasClass("disable-rename") && !$element.hasClass("disabled")) {
          clearTimeout(renameTimeout);
          renameTimeout = setTimeout(function() {
            $element.data("instance").rename();
          }, 500);
        }
      });
      
      this.$container.on("click", "a[data-folder-path]", function(event) {
        var path = $(event.currentTarget).data("folder-path");
        this.open(path);
        event.preventDefault();
      }.bind(this));
      
      this.$container.on("dblclick", "tr[data-folder-path], tr[data-file-path]", function(event) {
        clearTimeout(renameTimeout);
        var $element   = $(event.currentTarget).addClass("loading"),
            path       = $element.data("folder-path") || $element.data("file-path");
        
        if (!$element.hasClass("disabled")) {
          this.open(path);
        }
        
        event.preventDefault();
      }.bind(this));
      
      $window.on("resize.files_page", this.resize.bind(this));
      
      if (isInModalWindow) {
        protonet.one("modal_window.unload", function() {
          protonet.off(".files_page");
          $document.off(".files_page");
          protonet.utils.History.removeHook(this.historyHook);
          $.each(this.droppables, function(i, droppable) {
            protonet.ui.Droppables.remove(droppable);
          });
          this.uploader.destroy();
        }.bind(this));
      }
    }
  });
  
})();
