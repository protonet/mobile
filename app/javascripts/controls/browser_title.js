//= require "../utils/is_window_focused.js"

protonet.controls.BrowserTitle = (function() {
  var restoredTitle,
      animation,
      autoRestore,
      isAnimating,
      VISIBLE_CHARACTERS_IN_TITLE = 200;
      
  $(window).focus(_focus);
  
  function set(message, onlyWhenPageIsBlurred, shouldBeAnimated) {
    if (onlyWhenPageIsBlurred && protonet.utils.isWindowFocused()) {
      return;
    }
    
    if (shouldBeAnimated && isAnimating) {
      return;
    }
    
    restoredTitle = restoredTitle || document.title;
    
    // Auto restore title when page is focused
    autoRestore = onlyWhenPageIsBlurred;
    
    // Only set title and return if no animation wished
    if (!shouldBeAnimated) {
      document.title = message;
      return;
    }
    
    _animate(message);
  }
  
  function restore() {
    _stopAnimation();
    autoRestore = false;
    document.title = restoredTitle;
  }
  
  function _focus() {
    // Timeout is needed for Safari (who otherwise doesn't restore the title)
    setTimeout(function() {
      autoRestore && restore();
    }, 100);
  }
  
  function _animate(message) {
    var documentTitle = _extendTitle(message, message);
    document.title = documentTitle;
    
    animation = setInterval(function() {
      documentTitle = documentTitle.substr(1);
      documentTitle = _extendTitle(documentTitle, message);
      document.title = documentTitle;
    }, 400);
    
    isAnimating = true;
  }
  
  function _stopAnimation() {
    clearInterval(animation);
    isAnimating = false;
  }
  
  function _extendTitle(title, message) {
    while (title.length < VISIBLE_CHARACTERS_IN_TITLE) {
      title += " " + message;
    }
    return title;
  }
  
  
  
  return {
    set: set,
    restore: restore
  };
})();