//= require "../utils/prettify_file_size.js"
//= require "../utils/prettify_date.js"

protonet.p("files", function($page, $window) {
  var currentPath     = $.trim($page.find("[data-address-bar]").text()) || "/",
      isModalWindow   = $(".modal-window").length > 0,
      $content        = $page.find(".content"),
      $tableWrapper   = $page.find(".table-wrapper"),
      $tbody          = $page.find("tbody");
  
  
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
      });
      
      var resize = this.resize.bind(this);
      $window.on("resize", resize);
      
      protonet.one("modal_window.unload", function() {
        $window.off("resize", resize);
      });
    },
    
    list: function(files) {
      $tbody.empty();
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
            name:         info.name.truncate(60),
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
  ui.initialize();
  io.initialize();
  api.initialize();
});
