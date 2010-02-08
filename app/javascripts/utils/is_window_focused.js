protonet.utils.isWindowFocused = (function() {
  var focused = true;
  
  $(window).blur(function() {
    focused = false;
  });
  $(window).focus(function() {
    focused = true;
  });
  
  return function() {
    return focused;
  };
})();