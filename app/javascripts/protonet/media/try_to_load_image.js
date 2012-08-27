protonet.media.tryToLoadImage = (function() {
  var MAX_TRIES = 10;
  
  return function(url, success, failure) {
    var tries = 0;
    
    function loadRecursive() {
      var img = new Image();
      img.onerror = function() {
        if (++tries < MAX_TRIES) {
          setTimeout(loadRecursive, 500);
        } else {
          failure && failure();
        }
      };
      img.onload = success;
      img.src = url;
    }
    
    loadRecursive();
  };
})();