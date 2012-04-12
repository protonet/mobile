protonet.utils.isServerReachable = (function() {
  var supportsOnlineDetection = protonet.user.Browser.SUPPORTS_ONLINE_DETECTION();
  return function(callback) {
    if (supportsOnlineDetection) {
      callback(navigator.onLine);
      return;
    }
    
    var aborted,
        timeout,
        xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (aborted) {
        return;
      }
      
      if (xhr.readyState !== 4) {
        return;
      }
      
      clearTimeout(timeout);
      if (xhr.status === 0) {
        callback(false);
      } else {
        callback(true);
      }
    };
    
    xhr.open("HEAD", "/empty.html", true);
    
    try {
      xhr.send();
      timeout = setTimeout(function() {
        aborted = true;
        xhr.abort();
        callback(false);
      }, 3000);
    } catch(e) {
      callback(false);
    }
  };
})();