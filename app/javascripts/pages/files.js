protonet.p("files", function($page) {
  var filePath = $.trim($page.find("[data-file-path]").text()) || "/",
      $tbody   = $page.find("tbody");
  
  var observer = {
    list: function(data) {
      console.log(data.result);
    },
    
    info: function(data) {
      
    }
  };
  
  var ui = {
    list: function(data) {
      $.each(data, function(name, info) {
        
      });
    },
    
    item: function(name, info) {
      protonet.utils.Template("file-item-template", {
        name:     name.truncate(60),
        title:    name,
        size:     ,
        modified: 
      });
      var $tr         = $("<tr>"),
          $tdName     = $("<td>", { "class": "file-name" })                   .appendTo($tr),
          $tdUpdated  = $("<td>", { "class": "file-modified" })               .appendTo($tr),
          $tdSize     = $("<td>", { "class": "file-size" })                   .appendTo($tr);
          $link       = $("<a>",  { "class": "file", href: filePath + name }) .appendTo($tdName);
      return $tr;
    }
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
  }
  
  function unobserve() {
    $.each(observer, function(methodName, method) {
      protonet.off("fs." + methodName, method);
    });
  }
  
  observe();
  
  api.cd(filePath);
});
