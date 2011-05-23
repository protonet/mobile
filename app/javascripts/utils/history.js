protonet.utils.History = (function() {
  var HASH_PREFIX   = "#!", // HASHBANG-IN-YO-FACE!
      $window       = $(window),
      observers     = [],
      current       = null,
      history       = window.history,
      location      = window.location,
      usePushState  = history.pushState && false; // Set this to true, to use buggy HTML5 history.pushState
  
  function register(path) {
    if (path.startsWith("?")) {
      path = location.pathname + path;
    }
    
    if (path == current) {
      return;
    }
    
    if (usePushState) {
      history.pushState({ path: path }, "", path);
    } else {
      // Following line is needed for Firefox to avoid onhashchange fuckup
      current = path;
      location.hash = HASH_PREFIX + path;
      if (!path || path === location.pathname) {
        try { history.replaceState({}, "", location.pathname); } catch(e) {}
      }
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
    protonet.bind("history.change", function(e, path) {
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
        match = $.map(match, function(str) { return decodeURIComponent(str); })
        value[1].apply(window, match);
      }
    });
  }
  
  function _triggerChange(path) {
    if (path == current) {
      return;
    }
    current = path;
    protonet.trigger("history.change", path);
    _triggerObservers(path);
  }
  
  // Observe
  if (usePushState) {
    $window.bind("popstate", function(event) {
      var path = location.pathname + location.search;
      if ($.type(path) == "string") {
        _triggerChange(path);
      }
    });
  }
  
  $window.bind("hashchange", function() {
    var hash = getHash();
    if ($.type(hash) == "string") {
      _triggerChange(hash);
    }
  });
  
  // Check for history entries initially
  $(function() {
    // Timeout in order to let everything which is done ondomready initialize
    setTimeout(function() {
      var historyEntry = getCurrentPath();
      if (historyEntry) {
        _triggerChange(historyEntry);
      }
    }, 10);
  });
  
  return {
    register:       register,
    onChange:       onChange,
    getHash:        getHash,
    getCurrentPath: getCurrentPath,
    observe:        observe
  };
})();