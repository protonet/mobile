protonet.utils.isWindowFocused = (function() {
  /**
   * Opera and older versions of Firefox and Chrome
   * don't support document.hasFocus()
   * Therefore we just assume that the page is focussed
   * which is while loading the page most likely the case
   */
  var focused = $.isFunction(document.hasFocus) ? document.hasFocus() : true;
  
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