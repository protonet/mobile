/**
 * @example
 *    protonet.storage.set("foo", 1);
 */
protonet.storage = (function() {
  var tempStorage = {};
  
  return {
    set: function(key, value) {
      tempStorage[key] = value;
      try {
        // try/catch for silent fail when localStorage isn't available or full
        localStorage.setItem(key, JSON.stringify(value));
      } catch(e) {}
    },
    
    get: function(key) {
      if (typeof(tempStorage[key]) === "undefined") {
        try {
          tempStorage[key] = JSON.parse(localStorage.getItem(key));
        } catch(e) {}
      }
      return tempStorage[key];
    },
    
    remove: function(key) {
      delete tempStorage[key];
      window.localStorage && localStorage.removeItem(key);
    }
  };
})();