//= require "../utils/prettify_file_size.js"
//= require "../utils/prettify_date.js"

protonet.p("files", function($page, $window) {
  var currentFilePath = $.trim($page.find("[data-file-path]").text()) || "/",
      isModalWindow   = $(".modal-window").length > 0,
      $content        = $page.find(".content"),
      $tableWrapper   = $page.find(".table-wrapper"),
      $tbody          = $page.find("tbody");
  
  var observer = {
    list: function(data) {
      ui.list(data.result);
    },
    
    info: function(data) {
      
    }
  };
  
  var ui = {
    list: function(data) {
      $.each(data, function(name, info) {
        var $item = this.item(name, info);
        $item && $item.appendTo($tbody);
      }.bind(this));
    },
    
    item: function(name, info) {
      var fileData = {
            name:         name.truncate(60),
            rawName:      name,
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
  };
  
  var api = {
    cd: function(path) {
      send("fs.list", { parent: path });
    }
  };
  
  function send(method, params) {
    protonet.trigger("socket.send", $.extend({
      operation: method
    }, params));
  }
  
  function observe() {
    $.each(observer, function(methodName, method) {
      protonet.on("fs." + methodName, method);
    });
    
    $page.on("modal_window.unload", unobserve);
    
    $page.on("click", ".file, .folder", function(event) {
      event.preventDefault();
    });
  }
  
  function unobserve() {
    $.each(observer, function(methodName, method) {
      protonet.off("fs." + methodName, method);
    });
  }
  
  function resizeFileArea() {
    var currentHeight = $tableWrapper.outerHeight(),
        newHeight     = $page.outerHeight() - $tableWrapper.prop("offsetTop") - 20;
    $tableWrapper.css("min-height", newHeight.px());
  }
  
  function resize() {
    resizePage();
    resizeFileArea();
  }
  
  function resizePage() {
    if (!isModalWindow) {
      $content.css("height", ($window.height() - $content.offset().top - 40).px());
    }
  }
  
  $window.on("resize", resize);
  resize();
  
  protonet.on("modal_window.unload", function() {
    $window.off("resize", resize);
  });
  
  observe();
  
  /**
   * Ok, ready, set, go!
   */
  api.cd(currentFilePath);
});
