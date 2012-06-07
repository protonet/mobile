protonet.ui.Confirm = (function() {
  var defaultOptions = {
        headline: "Are you sure?",
        text:     "",
        content:  ""
      };
  
  return function(options) {
    var deferred = $.Deferred(),
        $section,
        $overlay;
    
    options = $.extend({}, defaultOptions, options);
    
    $section = new protonet.utils.Template("confirm-template", options).to$();
    $overlay = $("<div>", { "class": "confirm overlay" });
    $overlay.html($section);
    
    if (options.content) {
      $section.find("output").html(options.content);
    } else {
      $section.find("output").remove();
    }
    
    if (protonet.ui.ModalWindow.isVisible()) {
      protonet.ui.ModalWindow.append($overlay);
    } else {
      $overlay.appendTo("body");
    }
    
    $overlay.fadeIn();
    
    function hide(event) {
      $overlay.hide().remove();
    }
    
    $section
      .on("click", "button.confirm", function(event) {
        hide();
        deferred.resolve();
        event.preventDefault();
      })
      
      .on("click", "button.cancel",  function(event) {
        hide();
        deferred.reject();
        event.preventDefault();
      })
      
      .on("click", function(event) {
        event.stopPropagation();
      });
    
    $overlay
      .on("mousedown", function(event) {
        event.stopPropagation();
      })
      .on("click", function(event) {
        hide();
        event.preventDefault();
      })
      
      .on("keydown", function(event) {
        if (event.keyCode === 27) {
          // escape
          hide();
          event.preventDefault();
        }
        event.stopPropagation();
      });
    
    $section.find("button.confirm").focus();
    
    return deferred.promise();
  };
})();