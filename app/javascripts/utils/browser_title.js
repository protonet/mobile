protonet.utils.BrowserTitle = (function() {
  var restoredTitle,
      animation,
      autoRestore,
      isAnimating,
      doc                         = document,
      originalTitle               = doc.title,
      prefix                      = "",
      VISIBLE_CHARACTERS_IN_TITLE = 200;
      
  $(window).focus(_focus);
  
  function animate(message) {
    if (isAnimating) {
      return;
    }
    
    // Auto restore title when page is focused
    autoRestore = true;
    
    _animate(message);
  }
  
  function setPrefix(str) {
    prefix = str;
    autoRestore = true;
    if (!isAnimating) {
      doc.title = "(" + prefix + ") " + originalTitle;
    }
  }
  
  function restore() {
    _stopAnimation();
    prefix = "";
    autoRestore = false;
    doc.title = originalTitle;
  }
  
  function _focus() {
    // Timeout is needed for Safari (who otherwise doesn't restore the title)
    setTimeout(function() {
      autoRestore && restore();
    }, 100);
  }
  
  function _animate(message) {
    var documentTitle = _extendTitle(message, message);
    doc.title = documentTitle;
    
    animation = setInterval(function() {
      documentTitle = documentTitle.substr(1);
      documentTitle = _extendTitle(documentTitle, message);
      doc.title = prefix ?  ("(" + prefix + ") " + documentTitle) : documentTitle;
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
    animate: animate,
    setPrefix: setPrefix,
    restore: restore
  };
})();