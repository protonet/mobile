protonet.utils.History = (function() {
  var HASH_PREFIX = "#!", // HASHBANG-IN-YO-FACE!
      $window     = $(window),
      observers   = [],
      current     = null,
      history     = window.history,
      location    = window.location;
  
  function register(path) {
    if (path.startsWith("?")) {
      path = location.pathname + path;
    }
    
    if (path == current) {
      return;
    }
    
    if (history.pushState) {
      history.pushState({ path: path }, "", path);
    } else {
      // Following line is needed for Firefox to avoid onhashchange fuckup
      current = path;
      location.hash = HASH_PREFIX + path;
    }
    current = getCurrentPath();
    return this;
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
    return this;
  }
  
  function observe(regExp, method) {
    observers.push([regExp, method]);
    return this;
  }
  
  function _triggerObservers(path) {
    path = path || getCurrentPath();
    $.each(observers, function(i, value) {
      var match = path.match(value[0]);
      if (match) {
        match.shift();
        value[1].apply(window, match);
      }
    });
  }
  
  function _triggerChange(path) {
    if (path == current) {
      return;
    }
    current = path;
    protonet.Notifications.trigger("history.change", path);
    _triggerObservers(path);
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
  
  $(function() {
    var hash = getHash(),
        historyEntry = hash || (location.pathname + location.search);
    if (historyEntry) {
      _triggerChange(historyEntry);
    }
  });
  
  return {
    register:       register,
    onChange:       onChange,
    getHash:        getHash,
    getCurrentPath: getCurrentPath,
    observe:        observe
  };
})();