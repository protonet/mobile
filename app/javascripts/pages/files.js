//= require "../utils/prettify_file_size.js"
//= require "../utils/prettify_date.js"
//= require "../utils/parse_url.js"
//= require "../utils/parse_query_string.js"
//= require "../media/embed_file.js"
//= require "../effects/blink.js"

protonet.p("files", function($page, $window, $document) {
  var $body                       = $("body"),
      $addressBar                 = $page.find(".address-bar"),
      $content                    = $page.find(".content"),
      $fileDetails                = $page.find(".file-details"),
      $fileList                   = $page.find(".file-list"),
      $tableWrapper               = $page.find(".table-wrapper"),
      $tbody                      = $page.find("tbody"),
      $fileActions                = $content.find(".file-actions"),
      viewer                      = protonet.config.user_id,
      viewerPath                  = "/users/" + viewer + "/",
      currentPath                 = $.trim($addressBar.text()) || "/",
      isModalWindow               = $(".modal-window").length > 0,
      $scrollContainer            = isModalWindow ? $(".modal-window > output") : $("body, html"),
      REG_EXP_CHANNELS            = /^\/channels\/(\d+)\/$/,
      REG_EXP_USERS               = /^\/users\/(\d+)\/$/,
      REG_EXP_CHANNELS_SUB_FOLDER = /^\/channels\/(\d+)\/.*$/,
      PROTONET_FILES_MIME_TYPE    = "protonet/file",
      KEY_UP                      = 38,
      KEY_TAB                     = 9,
      KEY_DOWN                    = 40,
      KEY_ENTER                   = 13,
      undef;
  
  
  // --------------------------------- MARKER --------------------------------- \\
  var marker = {
    initialize: function() {
      this.$items = $();
      this._observe();
    },
    
    _observe: function() {
      $page.on("mousedown", "tbody tr", this._mousedown.bind(this));
      
      var clear   = this.clear.bind(this),
          keydown = this._keydown.bind(this);
      
      $document
        .on("mousedown", clear)
        .on("keydown",   keydown);
      
      protonet.one("modal_window.unload", function() {
        $document
          .off("mousedown", clear)
          .off("keydown",   keydown);
      });
    },
    
    clear: function() {
      this.set($());
    },
    
    set: function($newItems) {
      this.$items.removeClass("focus");
      this.$items = $newItems;
      this.$items.addClass("focus");
      navi.update();
    },
    
    _keydown: function(event) {
      this.typedCharacters = this.typedCharacters || "";
      
      var preventDefault,
          shiftKey        = event.shiftKey,
          keyCode         = event.keyCode,
          $newItems       = $();
          
      if (keyCode === KEY_TAB) {
        keyCode = shiftKey ? KEY_UP : KEY_DOWN;
        shiftKey = false;
      }
      
      switch(keyCode) {
        case KEY_ENTER:
          if (this.$items.length === 1) {
            preventDefault = true;
            this.$items.trigger("dblclick");
          }
          break;
        case KEY_UP:
          var $first = this.$items.first(),
              $prev  = $first.prev();
          if ($first.length && $prev.length) {
            if (shiftKey) {
              $newItems = this.$items.add($prev);
            } else {
              $newItems = $prev;
            }
          } else {
            if (shiftKey) {
              $newItems = this.$items;
            } else {
              $newItems = $first;
            }
          }
          
          this.scrollTo($newItems.first(), true);
          preventDefault = true;
          break;
        case KEY_DOWN:
          var $last = this.$items.last(),
              $next = $last.next();
          if ($last.length && $next.length) {
            if (shiftKey) {
              $newItems = this.$items.add($next);
            } else {
              $newItems = $next;
            }
          } else {
            if ($last.length) {
              if (shiftKey) {
                $newItems = this.$items;
              } else {
                $newItems = $last;
              }
            } else {
              // select first
              $newItems = $tbody.children().first();
            }
          }
          
          this.scrollTo($newItems.last(), false);
          preventDefault = true;
          break;
        default:
          var character = String.fromCharCode(keyCode).toLowerCase();
          if (character.match(/[\w\_\-\.]/)) {
            clearTimeout(keydownTimeout);
            var keydownTimeout = setTimeout(function() { this.typedCharacters = ""; }.bind(this), 1000);
            this.typedCharacters += character;
            var $rows   = $tbody.children(),
                i       = 0,
                length  = $rows.length,
                $row;
            
            for (; i<length; i++) {
              $row = $rows.eq(i);
              if ($row.data("file").name.toLowerCase().startsWith(this.typedCharacters)) {
                $newItems = $row;
                this.scrollTo($row);
                break;
              }
            }
          } else {
            $newItems = this.$items;
          }
      }
      
      this.set($newItems);
      if (preventDefault) {
        event.preventDefault();
      }
    },
    
    _mousedown: function(event) {
      var $current        = $(event.currentTarget),
          $newItems       = $(),
          $oldItems       = this.$items,
          alreadyFocused  = $current.hasClass("focus");
      
      if (event.ctrlKey || event.metaKey) {
        if (alreadyFocused) {
          $newItems = this.$items.not($current);
        } else {
          $newItems = this.$items.add($current);
        }
      } else if (event.shiftKey && $oldItems.length) {
        var $last = $oldItems.last();
        if ($last.index() < $current.index()) {
          $newItems = $oldItems.add($last.nextUntil($current.next()));
        } else if ($last.index() > $current.index()) {
          $newItems = $oldItems.add($last.prevUntil($current.prev()));
        }
      } else if (alreadyFocused) {
        $newItems = $oldItems;
      } else {
        $newItems = $current;
      }
      
      this.set($newItems);
      
      event.stopPropagation();
    },
    
    scrollTo: function($element, up) {
      // Scroll to the very top when the element is the first row
      if ($element.is(":first-child")) {
        $scrollContainer.prop("scrollTop", 0);
        return;
      // scroll to the very bottom when the element is the last row
      } else if ($element.is(":last-child")) {
        $scrollContainer.prop("scrollTop", $scrollContainer.prop("scrollHeight"));
        return;
      }
      
      var $input    = $('<input style="width: 0; height: 0; position: absolute; border: 0;">'),
          $sibling  = up ? $element.prev() : $element.next();
      
      $sibling.children().first().append($input);
      $input.focus().remove();
    }
  };
  
  
  // --------------------------------- NAVI --------------------------------- \\
  var navi = {
    initialize: function() {
      this.$actions = $fileActions.find("a");
      
      // this._observe();
    },
    
    update: function() {
      var hasWriteAccess = protonet.data.User.hasWriteAccessToFile(viewer, currentPath);
      
      uploader.disable();
      this.$actions.removeClass("enabled");
      
      if ($fileList.is(":visible")) {
        if (hasWriteAccess) {
          uploader.enable();
          this.$actions.filter(".new-document, .new-folder, .upload").addClass("enabled");
        }
      }
      
      if (marker.$items.length || $fileDetails.is(":visible")) {
        this.$actions.filter(".share").addClass("enabled");
        if (hasWriteAccess) {
          this.$actions.filter(".delete").addClass("enabled");
        }
      }
    }
  };
  
  
  // --------------------------------- UI --------------------------------- \\
  var ui = {
    initialize: function() {
      this._observe();
      this.resize();
    },
    
    _observe: function() {
      $page.on("click", ".file, .folder", function(event) {
        event.preventDefault();
      });
      
      $page.on("click", "a[data-folder-path]", function(event) {
        var path  = $(this).data("folder-path");
        api.open(path);
        event.preventDefault();
      });
      
      $page.on("dblclick", "tr[data-folder-path], tr[data-file-path]", function(event) {
        var $tr   = $(this).addClass("loading"),
            path  = $tr.data("folder-path") || $tr.data("file-path");
        api.open(path);
        event.preventDefault();
      });
      
      var resize = this.resize.bind(this);
      $window.on("resize", resize);
      
      protonet.one("modal_window.unload", function() {
        $window.off("resize", resize);
      });
    },
    
    list: function(files) {
      var that = this;
      
      $fileList.show();
      $fileDetails.html("").hide();
      $tbody.empty();
      
      marker.clear();
      uploader.enableDrag();
      addressBar.update();
      this.removeHint();
      
      if (!files) {
        this.insertHint("This folder doesn't seem to exist anymore");
        return;
      }
      
      if (!files.length) {
        var hint = "This folder is empty.";
        hint += " Drag & drop your files here to add them.";
        this.insertHint(hint);
        return;
      }
      
      this.prepareFileData(files, function(files) {
        files = sort.byName(files);
        
        $.each(files, function(i, file) {
          var $item = that.item(file);
          $item && $item.appendTo($tbody);
        });
      });
    },
    
    item: function(file) {
      var template = file.type + "-item-template",
          isViewer = file.path === viewerPath,
          $row;
          
      if (isViewer) {
        file.prettyName = file.prettyName + " <i>(that's you!)</i>";
      }
      
      $row = new protonet.utils.Template(template, file).to$();
      $row.data("file", file);
      
      if (isViewer) {
        $row.addClass("myself");
      }
      
      return $row;
    },
    
    info: function(file) {
      $fileList.hide();
      $fileDetails.show();
      
      $scrollContainer.scrollTop(0);
      
      uploader.disableDrag();
      addressBar.update();
      
      if (file.type === "missing") {
        ui.insertHint("This file doesn't seem to exist anymore");
        return;
      }
      
      this.removeHint();
      
      this.prepareFileData(file, function(files) {
        var file      = files[0],
            $element  = new protonet.utils.Template("file-details-template", file).to$();
        
        $element.data("file", file);

        marker.set($element);

        $fileDetails.html($element);
        protonet.media.embedFile($fileDetails.find("output.embed"), file);
        
        protonet.data.File.scan(file.path, function(data) {
          var html;
          if (data.malicious === true) {
            html = "<span class='negative'>Caution, this file might be malware or a virus!</span>";
          } else if (data.malicious === false) {
            html = "<span class='positive'>no</span>";
          } else {
            html = "<span class='negative'>no virus scan available</span>";
          }
          $fileDetails.find("output.virus-check").html(html);
        });
      });
    },
    
    prepareFileData: function(files, callback) {
      var model, ids;
      
      files = $.makeArray(files);
      
      $.each(files, function(i, file) {
        $.extend(file, {
          url:            protonet.data.File.getUrl(file.path),
          downloadUrl:    protonet.data.File.getDownloadUrl(file.path),
          prettyName:     file.name.truncate(70),
          prettySize:     file.size && protonet.utils.prettifyFileSize(file.size),
          prettyModified: protonet.utils.prettifyDate(file.modified)
        });

        if (file.uploaded) {
          file.prettyUploaded = protonet.utils.prettifyDate(file.uploaded);
        }

        file.uploaderId   = file.uploader_id || -1;
        file.uploaderName = protonet.data.User.getName(file.uploaderId) || ("user #" + file.uploaderId);
      });
      
      if (currentPath === "/users/") {
        model = protonet.data.User;
      } else if (currentPath === "/channels/") {
        model = protonet.data.Channel;
      } else {
        callback(files);
        return;
      }
      
      ids = $.map(files, function(file) {
        return file.type === "folder" ? file.name : null;
      });
      
      model.getAll(ids, function() {
        $.each(files, function(i, file) {
          if (file.type !== "folder") { return; }
          
          var record = model.getCache()[file.name] || {};
          if (record.rendezvousPartner) {
            var userName = (protonet.data.User.getName(record.rendezvousPartner) || "user # " + record.rendezvousPartner);
            userName = userName.truncate(20);
            file.prettyName = protonet.t("SHARED_BETWEEN_YOU_AND_USER", {
              user_name: userName
            });
            file.name = record.name;
            file.rendezvousFolder = true;
          } else {
            file.name = record.name || file.name;
            file.prettyName = file.name.truncate(70);
          }
        });
        callback(files);
      });
    },
    
    insertHint: function(text) {
      this.removeHint();
      $("<p>", { "class": "hint", html: text }).appendTo($tableWrapper);
    },

    removeHint: function() {
      $tableWrapper.find("p.hint").remove();
    },
    
    resizePage: function() {
      if (!isModalWindow) {
        $content.css("min-height", ($window.height() - $content.offset().top - 41).px());
      }
    },
    
    resizeFileArea: function() {
      var currentHeight = $tableWrapper.outerHeight(),
          newHeight     = $page.outerHeight() - $tableWrapper.prop("offsetTop") - 21;
      $tableWrapper.css("min-height", newHeight.px());
    },

    resize: function() {
      this.resizePage();
      this.resizeFileArea();
    },
    
    showError: function(error) {
      $tableWrapper.find("tr.loading").removeClass("loading");
      
      var errorMessage;
      switch (error) {
        case "Rpc::AccessDeniedError":
          errorMessage = "You don't have access to this file or folder";
          break;
        case "TimeoutError":
          errorMessage = "The request took too long to complete. Please try again.";
          break;
        default:
          errorMessage = "Unknown error. Please try again.";
      }
      protonet.trigger("flash_message.error", errorMessage);
    }
  };
  
  
  // --------------------------------- ADDRESS BAR --------------------------------- \\
  var addressBar = {
    create$Element: function(name, path) {
      var isFolder = protonet.data.File.isFolder(path), $element, model, match;
      
      if (isFolder) {
        $element = $("<a>", {
          "data-folder-path": path,
          text: name
        });
        
        if (path.match(REG_EXP_USERS)) {
          model = protonet.data.User;
        } else if (path.match(REG_EXP_CHANNELS)) {
          model = protonet.data.Channel;
        }
        
        if (model) {
          model.get(name, function(record) {
            var displayName;
            if (record && record.rendezvousPartner) {
              displayName = protonet.t("SHARED_BETWEEN_YOU_AND_USER", {
                user_name: (protonet.data.User.getName(record.rendezvousPartner) || "user (# " + record.rendezvousPartner + ")")
              });
            } else {
              displayName = record.name;
            }
            $element.html(displayName);
          });
        }
      } else {
        $element = $("<a>", {
          "data-file-path": path,
          text: name
        });
      }
      
      return $element;
    },
    
    update: function() {
      var pathParts     = currentPath.split("/"),
          isFolderPath  = protonet.data.File.isFolder(currentPath),
          $elements     = this.create$Element("Files", "/"),
          path          = "/";
      
      history.push();
      
      $.each(pathParts, function(i, part) {
        if (!part) {
          return;
        }
        
        path += part;
        
        // Don't add a slash at the end of file paths
        if (pathParts[i + 1] || isFolderPath) {
          path += "/";
        }
        $elements = $elements.add(this.create$Element(part, path));
      }.bind(this));
      
      $addressBar.html($elements);
      
      if (currentPath.startsWith(viewerPath)) {
        protonet.ui.Header.select("files", "my");
      } else {
        protonet.ui.Header.select("files", "index");
      }
    }
  };
  
  
  // --------------------------------- HISTORY --------------------------------- \\
  var history = {
    initialize: function() {
      this._observe();
    },
    
    push: function() {
      var url = protonet.data.File.getUrl(currentPath);
      protonet.utils.History.push(url);
    },
    
    change: function(url) {
      var parsedUrl     = protonet.utils.parseUrl(url),
          urlParameters = protonet.utils.parseQueryString(url);
      
      if (!parsedUrl.path.startsWith("/files")) {
        return false;
      }
      
      api.open(urlParameters.path);
      return true;
    },
    
    _observe: function() {
      var hook = this.change.bind(this);
      protonet.utils.History.addHook(hook);
      
      protonet.on("modal_window.unload", function() {
        protonet.utils.History.removeHook(hook);
      });
    }
  };
  
  
  // --------------------------------- API --------------------------------- \\
  var api = {
    initialize: function() {
      this.current = {};
      if (protonet.dispatcher.connected) {
        this.open(currentPath);
      } else {
        var connectCallback = function(status) {
          if (status) {
            protonet.off("socket.connected", connectCallback);
            this.open(currentPath);
          }
        }.bind(this);
        
        protonet.on("socket.connected", connectCallback);
      }
    },
    
    cd: function(path) {
      currentPath = path;
      return protonet.data.File.list(path, {
        success: ui.list.bind(ui),
        error:   ui.showError.bind(ui)
      });
    },
    
    open: function(path) {
      path = path || "/";
      
      this.currentRequest && this.currentRequest.abort();
      
      var isFolder = protonet.data.File.isFolder(path);
      if (isFolder) {
        this.currentRequest = api.cd(path);
      } else {
        currentPath = path;
        this.currentRequest = protonet.data.File.get(path, {
          success: ui.info.bind(ui),
          error:   ui.showError.bind(ui)
        });
      }
    },
    
    rm: function(path) {
      
    }
  };
  
  
  // --------------------------------- SORTER --------------------------------- \\
  var sort = {
    byName: function(fileList) {
      var current,
          folders           = [],
          rendezvousFolders = [],
          files             = [],
          i                 = 0,
          length            = fileList.length;
      
      for (; i<length; i++) {
        current = fileList[i];
        if (current.type === "folder") {
          current.rendezvousFolder ? rendezvousFolders.push(current) : folders.push(current);
        } else {
          files.push(current);
        }
      }
      
      this._byName(folders);
      this._byName(rendezvousFolders);
      this._byName(files);
      
      return folders.concat(rendezvousFolders).concat(files);
    },
    
    _byName: function(arr) {
      arr.sort(function(a, b) {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if (a > b) { return 1; }
        if (a < b) { return -1; }
        return 0;
      });
    }
  };
  
  
  // --------------------------------- UPLOADER --------------------------------- \\
  var uploader = {
    initialize: function() {
      this.uploader = new protonet.media.Uploader({
        drop_element:  "plupload-drop-element",
        browse_button: "plupload-browse-button"
      });
      
      this._observe();
    },
    
    enableDrag: function() {
      if (this.uploader.features.dragdrop) {
        $tableWrapper.attr("draggable", "true");
      }
    },
    
    disableDrag: function() {
      $tableWrapper.removeAttr("draggable");
    },
    
    disable: function() {
      this.uploader.disable();
    },
    
    enable: function() {
      this.uploader.enable();
    },
    
    _observe: function() {
      var timeout, blinker, fromPath, toPath, dragItems = [], dragPaths = [];
      
      if (!this.uploader.features.dragdrop) { return; }
      
      protonet.ui.Droppables.add({
        types:      "files",
        elements:   ".table-wrapper",
        condition:  function() {
          return protonet.data.User.hasWriteAccessToFile(viewer, currentPath);
        }
      });
      
      protonet.ui.Droppables.add({
        types:      PROTONET_FILES_MIME_TYPE,
        elements:   ".table-wrapper",
        className:  "dragover-protonet-files",
        indicator:  "dragover-possible-protonet-files",
        condition:  function($element) {
          return protonet.data.User.hasWriteAccessToFile(viewer, currentPath);
        }
      });
      
      protonet.ui.Droppables.add({
        types:      protonet.ui.Droppables.FILES.concat(PROTONET_FILES_MIME_TYPE),
        elements:   ".files-page [data-folder-path]",
        condition:  function($element) {
          // don't highlight when the item being dragged is the folder (you cannot move a folder into itself)
          return dragPaths.indexOf($element.data("folder-path")) === -1;
        },
        ondragenter:  function($element) {
          blinker = protonet.effects.blink($element, {
            delay:    (0.5).seconds(),
            interval: (0.25).seconds(),
            callback: function() { $element.click().dblclick(); }
          });
        },
        ondragleave:  function($element) {
          blinker.stop();
        }
      });
      
      function stringifyDataTransfer(files) {
        return JSON.stringify({
          node:   protonet.config.node_id,
          files:  files
        });
      }
      
      function parseDataTransfer(str) {
        return JSON.parse(str);
      }
      
      function createUriList(files) {
        str = "";
        $.each(files, function(i, file) {
          str += "\n" + protonet.data.File.getUrl(file.path);
        });
        return str;
      }
      
      function dragstart(event) {
        if (!event.dataTransfer)    { event.preventDefault(); }
        if (!marker.$items.length)  { event.preventDefault(); }
        
        var dataTransfer  = event.dataTransfer,
            $dragImage    = $("<table>", { "class": "drag-image" })
              .append(marker.$items.clone())
              .insertAfter($tableWrapper);
        
        $.each(marker.$items, function(i, element) {
          var file = $(element).data("file");
          dragItems.push(file);
          dragPaths.push(file.path);
        });
        
        fromPath = currentPath;
        
        dataTransfer.effectAllowed = "copyMove";
        dataTransfer.setData(PROTONET_FILES_MIME_TYPE, stringifyDataTransfer(dragItems));
        dataTransfer.setData("text/uri-list", createUriList(dragItems));
        dataTransfer.setDragImage($dragImage[0], 10, 10);
        
        // Timeout is necessary for webkit to capture a snapshot of the element
        setTimeout(function() { $dragImage.remove(); }, 0);
      }
      
      // TODO: Draggables
      $content.bind("dragstart", dragstart);
    }
  };
  
  /**
   * Initialize
   */
  ui.initialize();
  navi.initialize();
  uploader.initialize();
  history.initialize();
  marker.initialize();
  api.initialize();
});
