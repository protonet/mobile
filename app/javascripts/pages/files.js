//= require "../utils/prettify_file_size.js"
//= require "../utils/prettify_date.js"
//= require "../utils/parse_url.js"
//= require "../utils/parse_query_string.js"

protonet.p("files", function($page, $window, $document) {
  var $addressBar       = $page.find(".address-bar"),
      $content          = $page.find(".content"),
      $fileDetails      = $page.find(".file-details"),
      $fileList         = $page.find(".file-list"),
      $tableWrapper     = $page.find(".table-wrapper"),
      $tbody            = $page.find("tbody"),
      currentPath       = $.trim($addressBar.text()) || "/",
      isModalWindow     = $(".modal-window").length > 0,
      $scrollContainer  = isModalWindow ? $(".modal-window > output") : $("body, html"),
      KEY_UP            = 38,
      KEY_TAB           = 9,
      KEY_DOWN          = 40,
      KEY_ENTER         = 13;
  
  
  // --------------------------------- UTILS --------------------------------- \\
  var utils = {
    getAbsolutePath: function(path) {
      if (path.startsWith("/")) {
        return path;
      }
      
      var folderPath = currentPath.replace(/[^\/]+$/, "");
      
      return folderPath + path;
    },
    
    getHttpPath: function(name) {
      var path = this.getAbsolutePath(name);
      return "/files/?path=" + encodeURIComponent(path);
    },
    
    getDownloadPath: function(name) {
      return protonet.config.node_base_url +
        "/fs/download/?paths=" + encodeURIComponent(this.getAbsolutePath(name)) +
        "&user_id="            + encodeURIComponent(protonet.config.user_id) + 
        "&token="              + encodeURIComponent(protonet.config.token);
    }
  };
  
  
  // --------------------------------- OBSERVER --------------------------------- \\
  var observer = {
    list: function(data) {
      currentPath = data.params.parent;
      if (!currentPath.endsWith("/")) {
        currentPath += "/";
      }
      
      ui.list(data.result);
    },
    
    info: function(data) {
      var result = data.result[0];
      currentPath = result.path;
      ui.info(result);
    }
  };
  
  
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
      this.$items.removeClass("focus");
      this.$items = $();
    },
    
    set: function($newItems) {
      this.$items.removeClass("focus");
      this.$items = $newItems;
      this.$items.addClass("focus");
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
          alreadyFocused  = $current.hasClass("focus");
      
      if (event.ctrlKey || event.metaKey) {
        if (alreadyFocused) {
          $newItems = this.$items.not($current);
        } else {
          $newItems = this.$items.add($current);
        }
      } else if (event.shiftKey && this.$items.length) {
        var $last = this.$items.last();
        if ($last.index() < $current.index()) {
          $newItems = this.$items.add($last.nextUntil($current.next()));
        } else if ($last.index() > $current.index()) {
          $newItems = this.$items.add($last.prevUntil($current.prev()));
        }
      } else {
        $newItems = $current;
      }
      
      this.set($newItems);
      
      event.preventDefault();
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
      
      $page.on("dblclick", "tr[data-folder-path]", function(event) {
        api.cd($(this).data("folder-path"));
        event.preventDefault();
      });
      
      $page.on("click", "a[data-folder-path]", function(event) {
        api.cd($(this).data("folder-path"));
        event.preventDefault();
      });
      
      $page.on("dblclick", "tr[data-file-path]", function(event) {
        api.open($(this).data("file-path"));
        event.preventDefault();
      });
      
      var resize = this.resize.bind(this);
      $window.on("resize", resize);
      
      protonet.one("modal_window.unload", function() {
        $window.off("resize", resize);
      });
    },
    
    list: function(files) {
      marker.clear();
      
      $fileList.show();
      $fileDetails.hide();
      $tbody.empty();
      
      this.updateAddressBar();
      this.removeHint();
      if (!files) {
        this.insertHint("This folder doesn't seem to exist anymore");
        return;
      }
      
      if (!files.length) {
        this.insertHint("This folder doesn't contain any files");
        return;
      }
      
      files = sort.byName(files);
      
      $.each(files, function(i, info) {
        var $item = this.item(info);
        $item && $item.appendTo($tbody);
      }.bind(this));
    },
    
    info: function(fileData) {
      $fileList.hide();
      $fileDetails.show();
      
      $scrollContainer.scrollTop(0);
      
      this.updateAddressBar();
      
      if (fileData.type === "missing") {
         ui.insertHint("This file doesn't seem to exist anymore");
         return;
      }
      
      this.removeHint();
      
      fileData = this.prepareFileData(fileData);
      
      var $element = new protonet.utils.Template("file-details-template", fileData).to$();
      $element.data("file", fileData);
      
      marker.set($element);
      
      $fileDetails.html($element);
      
      io.scan(fileData.path, function(isMalicious) {
        var html;
        if (isMalicious === true) {
          html = "<span class='negative'>Caution, this file might be malware or a virus!</span>";
        } else if (isMalicious === false) {
          html = "<span class='positive'>no</span>";
        } else {
          html = "<span class='negative'>no virus scan available</span>";
        }
        
        $fileDetails.find("output.virus-check").html(html);
      });
    },
    
    item: function(info) {
      var template = info.type + "-item-template",
          fileData = this.prepareFileData(info),
          $row = new protonet.utils.Template(template, fileData).to$();
      
      $row.data("file", fileData);
      
      return $row;
    },
    
    prepareFileData: function(data) {
      var result = {
        path:         utils.getAbsolutePath(data.name),
        downloadPath: utils.getDownloadPath(data.name),
        httpPath:     utils.getHttpPath(data.name),
        name:         (data.display_name || data.name).truncate(70),
        rawName:      data.name,
        size:         protonet.utils.prettifyFileSize(data.size),
        rawSize:      data.size,
        modified:     protonet.utils.prettifyDate(data.modified),
        rawModified:  data.modified,
        mime:         data.mime
      };
      
      if (data.uploaded) {
        result.rawUploaded = data.uploaded;
        result.uploaded = protonet.utils.prettifyDate(data.uploaded);
      }
      
      
      result.uploaderId = data.uploader_id || -1;
      result.uploaderName = data.uploader_name || "system user";
      
      return result;
    },
    
    insertHint: function(text) {
      this.removeHint();
      $("<p>", { "class": "hint", text: text }).appendTo($tableWrapper);
    },

    removeHint: function() {
      $tableWrapper.find("p.hint").remove();
    },
    
    resizePage: function() {
      if (!isModalWindow) {
        $content.css("min-height", ($window.height() - $content.offset().top - 40).px());
      }
    },
    
    resizeFileArea: function() {
      var currentHeight = $tableWrapper.outerHeight(),
          newHeight     = $page.outerHeight() - $tableWrapper.prop("offsetTop") - 20;
      $tableWrapper.css("min-height", newHeight.px());
    },

    resize: function() {
      this.resizePage();
      this.resizeFileArea();
    },
    
    updateAddressBar: function() {
      var pathParts   = currentPath.split("/"),
          get$Element = function(name, path) {
            if (path.endsWith("/")) {
              return $("<a>", {
                "data-folder-path": path,
                text: name
              });
            } else {
              return $("<a>", {
                "data-file-path": path,
                text: name
              });
            }
          },
          $elements   = get$Element("protonet", "/"),
          path        = "/";
      
      history.push();
      
      $.each(pathParts, function(i, part) {
        if (!part) {
          return;
        }
        
        path += part;
        
        // Don't add a slash at the end of file paths
        if (pathParts[i + 1]) {
          path += "/";
        }
        $elements = $elements.add(get$Element(part, path));
      });
      
      $addressBar.html($elements);
    }
  };
  
  
  // --------------------------------- HISTORY --------------------------------- \\
  var history = {
    initialize: function() {
      this._observe();
    },
    
    push: function() {
      var url = currentPath === "/" ? "/files" : utils.getHttpPath(currentPath);
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
      io.send("fs.list", { parent: path });
    },
    
    open: function(path) {
      path = path || "/";
      
      var isFolder = path.endsWith("/");
      if (isFolder) {
        return api.cd(path);
      }
      
      io.send("fs.info", { paths: [path] });
    }
  };
  
  
  // --------------------------------- IO --------------------------------- \\
  var io = {
    initialize: function() {
      this._observe();
    },
    
    _observe: function() {
      $.each(observer, function(methodName, method) {
        protonet.on("fs." + methodName, method);
      });
      
      protonet.one("modal_window.unload", function() {
        $.each(observer, function(methodName, method) {
          protonet.off("fs." + methodName, method);
        });
      });
    },
    
    send: function(method, params) {
      protonet.trigger("socket.send", {
        operation: method,
        params:    params
      });
    },
    
    scan: function(path, callback) {
      var url = protonet.config.node_base_url + "/fs/scan?path=" + encodeURIComponent(path);
      protonet.utils.crossDomainXHR(url, {
        success: function(responseText) {
          var json = JSON.parse(responseText);
          callback(json.malicious);
        },
        error: function() {
          callback(undefined);
        }
      });
    }
  };
  
  
  // --------------------------------- SORTER --------------------------------- \\
  var sort = {
    byName: function(fileList) {
      var current,
          folders = [],
          files   = [],
          i       = 0,
          length  = fileList.length;
      
      for (; i<length; i++) {
        current = fileList[i];
        current.type === "folder" ? folders.push(current) : files.push(current);
      }
      
      this._byName(folders);
      this._byName(files);
      
      return folders.concat(files);
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
  
  /**
   * Initialize
   */
  ui.initialize();
  history.initialize();
  marker.initialize();
  io.initialize();
  api.initialize();
});
