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
    renderList: function() {
      var $tr         = $("<tr>"),
          $tdName     = $("<td>", { "class": "file-name" }),
          $tdUpdated  = $("<td>", { "class": "file-updated" });
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
    $page.on("unload", unobserve);
  }
  
  function unobserve() {
    $.each(observer, function(methodName, method) {
      protonet.off("fs." + methodName, method);
    });
  }
  
  observe();
  
  api.cd(filePath);
});
