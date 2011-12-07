protonet.ui.Overlay = (function() {
  var $overlay,
      $textContainer;
  
  return function(text) {
    $overlay        = $overlay        || $("<div>", { "class": "overlay" });
    $textContainer  = $textContainer  || $("<div>",   { "class": "info-message" });
    $textContainer.html(text);
    $textContainer.appendTo($overlay);
    $overlay.appendTo("body").fadeIn();
    $overlay.delegate(".close", "click", this.hide);
    
    this.hide = function() {
      $overlay.fadeOut("fast", function() {
        $overlay.detach();
      });
    };
  };
})();