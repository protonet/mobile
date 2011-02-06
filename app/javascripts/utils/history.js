protonet.utils.History = (function() {
  var HASH_PREFIX = "#history:",
      $window     = $(window),
      history     = window.history,
      location    = window.location;
  
  function register(path) {
    if (path.startsWith("?")) {
      path = location.pathname + path;
    }
    
    if (history.pushState) {
      history.pushState({ path: path }, "", path);
    } else {
      location.hash = HASH_PREFIX + path;
    }
  }
  
  function getHash() {
    var hash = location.hash;
    if (hash.startsWith(HASH_PREFIX)) {
      return hash.substr(HASH_PREFIX.length);
    }
    return "";
  }
  
  function getCurrentPath() {
    var hash = getHash();
    if (hash) {
      return hash;
    }
    
    return location.pathname  + location.search;
  }
  
  function onChange(callback) {
    protonet.Notifications.bind("history.change", function(e, path) {
      callback(path);
    });
  }
  
  function _triggerChange(path) {
    protonet.Notifications.trigger("history.change", path);
  }
  
  
  // Observe
  $window
    .bind("popstate", function(event) {
      var path = location.pathname + location.search;
      if ($.type(path) == "string") {
        _triggerChange(path);
      }
    })
    .bind("hashchange", function() {
      var hash = getHash();
      if ($.type(hash) == "string") {
        _triggerChange(hash);
      }
    });
  
  return {
    register:       register,
    onChange:       onChange,
    getHash:        getHash,
    getCurrentPath: getCurrentPath
  };
})();