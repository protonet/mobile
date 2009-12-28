protonet.controls.BrowserTitle = (function() {
  var restoredTitle, isBlurred, animation, autoRestore;
  
  $(window).blur(_blur);
  $(window).focus(_focus);
  
  function set(message, onlyWhenPageIsBlurred) {
    if (onlyWhenPageIsBlurred && !_isPageBlurred()) {
      return;
    }
    
    restoredTitle = restoredTitle || document.title;
    
    document.title = message;
    
    // Auto restore title when page is focused
    autoRestore = onlyWhenPageIsBlurred;
  }
  
  function restore() {
    autoRestore = false;
    document.title = restoredTitle;
  }
  
  function _isPageBlurred() {
    return isBlurred;
  }
  
  function _blur() {
    isBlurred = true;
  }
  
  function _focus() {
    // Timeout is needed for Safari (who otherwise doesn't restore the title)
    setTimeout(function() {
      isBlurred = false;
      autoRestore && restore();
    }, 100);
    
  }
  
  return {
    set: set,
    restore: restore
  };
})();