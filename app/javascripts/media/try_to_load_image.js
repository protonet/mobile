protonet.media.tryToLoadImage = (function() {
  var MAX_TRIES = 10;
  
  return function(url, callback) {
    var tries = 10;
    
    function loadRecursive() {
      var img = new Image();
      img.onerror = function() {
        if (++tries < MAX_TRIES) {
          setTimeout(loadRecursive, 500);
        }
      };
      img.onload = callback;
      img.src = url;
    }
    
    loadRecursive();
  };
})();