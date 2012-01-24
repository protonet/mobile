//= require "../utils/prettify_file_size.js"
//= require "../utils/prettify_date.js"

protonet.p("files", function($page, $window, $document) {
  var $addressBar     = $page.find(".address-bar"),
      $content        = $page.find(".content"),
      $tableWrapper   = $page.find(".table-wrapper"),
      $tbody          = $page.find("tbody"),
      currentPath     = $.trim($addressBar.text()) || "/",
      isModalWindow   = $(".modal-window").length > 0;
  
  
  // --------------------------------- UTILS --------------------------------- \\
  var utils = {
    getAbsolutePath: function(path) {
      if (path.startsWith("/")) {
        return path;
      }
      return currentPath + path;
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
      
    }
  };
  
  
  var marker = {
    initialize: function() {
      this.$items = $();
      this._observe();
    },
    
    _observe: function() {
      $page.on("mousedown", "tbody tr", function(event) {
        var $current        = $(event.currentTarget),
            alreadyFocused  = $current.hasClass("focus");
        
        if (event.ctrlKey || event.metaKey) {
          if (alreadyFocused) {
            $current.removeClass("focus");
            this.$items = this.$items.not($current);
          } else {
            this.$items = this.$items.add($current);
          }
        } else if (event.shiftKey && this.$items.length) {
          var $last = this.$items.last();
          if ($last.index() < $current.index()) {
            this.$items = this.$items.add($last.nextUntil($current.next()), ":not(.focus)");
          } else if ($last.index() > $current.index()) {
            this.$items = this.$items.add($last.prevUntil($current.prev()), ":not(.focus)");
          }
        } else {
          this.$items.removeClass("focus");
          this.$items = $current;
        }
        
        this.$items.addClass("focus");
        
        event.preventDefault();
        event.stopPropagation();
      }.bind(this));
      
      var clear = this.clear.bind(this);
      $document.on("mousedown", clear);
      
      protonet.one("modal_window.unload", function() {
        $document.off("mousedown", clear);
      });
    },
    
    clear: function() {
      this.$items.removeClass("focus");
      this.$items = $();
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
      
      var resize = this.resize.bind(this);
      $window.on("resize", resize);
      
      protonet.one("modal_window.unload", function() {
        $window.off("resize", resize);
      });
    },
    
    list: function(files) {
      marker.clear();
      
      $tbody.empty();
      
      this.updateAddressBar();
      this.removeHint();
      
      if (!files.length) {
        this.insertHint("This folder doesn't contain any files");
        return;
      }
      
      $.each(files, function(i, info) {
        var $item = this.item(info);
        $item && $item.appendTo($tbody);
      }.bind(this));
    },
    
    item: function(info) {
      var fileData = {
            path:         utils.getAbsolutePath(info.name),
            name:         info.name.truncate(70),
            rawName:      info.name,
            size:         protonet.utils.prettifyFileSize(info.size),
            rawSize:      info.size,
            modified:     protonet.utils.prettifyDate(info.modified),
            rawModified:  info.modified
          };
      
      if (info.type === "folder") {
        return new protonet.utils.Template("folder-item-template", fileData).to$();
      } else if (info.type === "file") {
        return new protonet.utils.Template("file-item-template", fileData).to$();
      }
    },
    
    insertHint: function(text) {
      $("<p>", { "class": "hint", text: text }).appendTo($tableWrapper);
    },

    removeHint: function(text) {
      $tableWrapper.find("p.hint").remove();
    },
    
    resizePage: function() {
      if (!isModalWindow) {
        $content.css("height", ($window.height() - $content.offset().top - 40).px());
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
      var folders     = currentPath.split("/"),
          get$Element = function(name, path) {
            return $("<a>", {
              "data-folder-path": path,
              text: name
            });
          },
          $elements   = get$Element("protonet/", "/"),
          path        = "/";
      
      $.each(folders, function(i, folder) {
        if (!folder) {
          return;
        }
        
        folder += "/";
        path += folder;
        $elements = $elements.add(get$Element(folder, path));
      });
      
      $addressBar.html($elements);
    }
  };
  
  
  // --------------------------------- API --------------------------------- \\
  var api = {
    initialize: function() {
      this.cd(currentPath);
    },
    
    cd: function(path) {
      io.send("fs.list", { parent: path });
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
    }
  };
  
  
  /**
   * Initialize
   */
  try {ui.initialize();
  marker.initialize();
  io.initialize();
  api.initialize();} catch(e) {alert(e)}
});
