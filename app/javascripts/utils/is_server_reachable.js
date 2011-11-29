protonet.utils.isServerReachable = (function() {
  var supportsOnlineDetection = protonet.user.Browser.SUPPORTS_ONLINE_DETECTION();
  return function(callback) {
    if (supportsOnlineDetection) {
      callback(navigator.onLine);
      return;
    }
    
    var aborted,
        xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
      if (aborted) {
        return;
      }
      
      if (xhr.readyState !== 4) {
        return;
      }
      
      if (xhr.status === 0) {
        callback(false);
      } else {
        callback(true);
      }
    };
    
    // phone home
    xhr.open("HEAD", "/empty.html", true);
    
    try {
      xhr.send();
      setTimeout(function() {
        aborted = true;
        xhr.abort();
      }, 1000);
    } catch(e) {
      callback(false);
    }
  };
})();