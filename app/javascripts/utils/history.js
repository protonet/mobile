protonet.utils.History = (function() {
  var $window       = $(window),
      hooks         = [],
      fallbacks     = [],
      frozen        = false,
      tempLink      = document.createElement("a"),
      history       = window.history;
  
  function normalize(url) {
    tempLink.setAttribute("href", url);
    return tempLink.href;
  }
  
  function replace(url, additionalParams) {
    url = normalize(url);
    if (history.replaceState) {
      history.replaceState($.extend({ url: url }, additionalParams), "", url);
    }
    return this;
  }
  
  function push(url, additionalParams) {
    url = normalize(url);
    if (url !== location.href && history.pushState && !frozen) {
      history.pushState($.extend({ url: url }, additionalParams), "", url);
      freeze(0);
    }
    return this;
  }
  
  function freeze(duration) {
    frozen = true;
    setTimeout(function() {
      frozen = false;
    }, duration);
  }
  
  function addHook(method) {
    hooks.push(method);
    return this;
  }
  
  function addFallback(method) {
    fallbacks.push(method);
    return this;
  }
  
  protonet.on("history.change", function(path, additionalParams) {
    var i = 0, j = 0, hooksLength = hooks.length, fallbacksLength = fallbacks.length, returnValue;
    for (; i<hooksLength; i++) {
      returnValue = returnValue || hooks[i](path, additionalParams);
    }
    
    if (!returnValue) {
      for (; j<fallbacksLength; j++) {
        fallbacks[j](path, additionalParams);
      }
    }
  });
  
  // Omit first popstate when history.state doesn't exist
  $window.bind("popstate", function(event) {
    if (!("state" in history)) {
      history.state = event.originalEvent.state;
      return;
    }
    var state = event.originalEvent.state || { url: location.href };
    protonet.trigger("history.change", state.url, state);
  });
  
  return {
    push:           push,
    replace:        replace,
    addFallback:    addFallback,
    addHook:        addHook
  };
})();