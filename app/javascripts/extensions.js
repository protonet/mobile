//---------------------------- CONSOLE ----------------------------
if (typeof(console) == "undefined" || !console.log) {
  console = { log: function() {} };
}




//---------------------------- FUNCTION ----------------------------
if (!Function.prototype.bind) {
  Function.prototype.bind = function() {
    if (arguments.length < 2 && arguments[0] === undefined) {
      return this;
    }
    var thisObj = this,
        args = Array.prototype.slice.call(arguments),
        obj = args.shift();
    return function () {
      return thisObj.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
    };
  };
}




//---------------------------- ARRAY ----------------------------
Array.prototype.chunk = function() {
  var DELAY = 50,
      MAX_EXECUTION_TIME = 100;
  return function(iterator, callback) {
    var arr = this, i = 0, returnValues = [], iterationLength = arr.length, time;
    var perform = function() {
      time = new Date();
      while (i<iterationLength) {
        returnValues.push(iterator(arr[i], i));
        i++;
        if ((new Date() - time) > MAX_EXECUTION_TIME) {
          /** Breathe */
          setTimeout(function() { perform(); }, DELAY);
          return;
        }
      }
      callback && setTimeout(function() { callback(returnValues); }, DELAY);
    };
    perform();
  };
}();

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) {
      i = length + i;
    }
    for (; i < length; i++) {
      if (this[i] === item) {
        return i;
      }
    }
    return -1;
  };
}

Array.prototype.unique = function () {
  var array = this;
  var result = [];
  for (var i = array.length; i--; ) {
    var val = array[i];
    if ($.inArray(val, result) === -1) {
      result.unshift(val);
    }
  }
  return result;
};

//---------------------------- STRING ----------------------------
String.prototype.startsWith = function(str) {
  return this.indexOf(str) === 0;
};

String.prototype.endsWith = function(str) {
  var d = this.length - str.length;
  return d >= 0 && this.lastIndexOf(str) === d;
};

String.prototype.truncate = function(length) {
  var truncation = "...";
  return this.length > length ? this.slice(0, length - truncation.length) + truncation : String(this);
};

String.prototype.px = function() {
  return this + "px";
};

String.prototype.isUrl = function() {
  var url = this,
      hasMinLength = url.length > 10,
      hasUrlPrefix = url.startsWith("http") || url.startsWith("www.");
  
  return hasMinLength && hasUrlPrefix;
};

String.prototype.isEmail = (function() {
  var REG_EXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  return function() {
    return REG_EXP.test(this+"");
  };
})();

String.prototype.count = function(str) {
  return str.split(str).length - 1;
};




//---------------------------- NUMBER ----------------------------
Number.prototype.px = function() {
  return this + "px";
};


Number.prototype.second = Number.prototype.seconds = function() {
  return this * 1000;
};


//---------------------------- AUDIO ------------------------------
(function() {
  /**
   * Shim for HTML5 audio
   */
  var userAgent                 = navigator.userAgent.toLowerCase(),
      // Safari sometimes randomly crashes when playing sound
      audioIsBuggy              = (userAgent.indexOf("safari") !== -1 && userAgent.indexOf("chrome") === -1),
      // IE < 9 requires the confirmation of the user to use the plugin "Windows Media Player Core"
      requiresUserConfirmation  = userAgent.match(/msie/);
  
  if (window.Audio && window.Audio.prototype) {
    window.Audio.prototype.replay = function() {
      // this can cause js errors in chrome under certain circumstances...
      try { this.currentTime = 0; } catch(e) {}
    };
  }
  
  if ((!window.Audio || audioIsBuggy) && !requiresUserConfirmation) {
    window.Audio = function(src) {
      this.src = src;
    };
    
    window.Audio.prototype = {
      play: (function() {
        var audioHost;
        return function() {
          try { audioHost.parentNode.removeChild(audioHost); } catch(e) {}
          
          audioHost = document.createElement("embed");
          audioHost.setAttribute("src", this.src);
          audioHost.setAttribute("hidden", true);
          document.body.appendChild(audioHost);
        };
      })(),
      
      replay: function() {
        this.play();
      },
      
      canPlayType: function(type) {
        switch(type) {
          case "audio/wav":
            return true;
          default:
            return false;
        }
      }
    };
  }
})();


//---------------------------- OBJECT ------------------------------
if (!Object.keys) {
  Object.keys = function(object) {
    if (object.toString() !== "[object Object]") {
      throw new TypeError();
    }
    var results = [];
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        results.push(property);
      }
    }
    return results;
  };
}



//---------------------------- WEBSOCKET -------------------------
window.WebSocket = window.MozWebSocket || window.WebSocket;

// --------------------------- User Media -------------------------
if (!navigator.getUserMedia) {
  navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
}

// --------------------------- window.URL -------------------------
if (!window.URL) {
  window.URL = window.webkitURL || window.msURL || window.oURL;
}

// --------------------------- Element -------------------------
(function() {
  var prototype = Element.prototype;
  if (!prototype.matchesSelector) {
    prototype.matchesSelector = prototype.webkitMatchesSelector || prototype.mozMatchesSelector || prototype.oMatchesSelector || prototype.msMatchesSelector;
  }
})();