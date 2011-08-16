//---------------------------- CONSOLE ----------------------------
if (typeof(console) == "undefined" || !console.log) {
  console = { log: function() {} };
}




//---------------------------- LOCAL STORAGE ----------------------------
if (typeof(localStorage) == "undefined") {
  window.localStorage = window.sessionStorage || {
    setItem: function(key, value) {
      this[key] = value;
    },
    
    getItem: function(key) {
      return this[key];
    },
    
    removeItem: function(key) {
      delete this[key];
    }
  };
}




//---------------------------- FUNCTION ----------------------------
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




//---------------------------- STRING ----------------------------
String.prototype.startsWith = function(str) {
  return this.indexOf(str) === 0;
};

String.prototype.endsWith = function(str) {
  var d = this.length - str.length;
  return d >= 0 && this.lastIndexOf(str) === d;
};

String.prototype.capitalize = function() {
  return this.substr(0, 1).toUpperCase() + this.substr(1);
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


//---------------------------- AUDIO ------------------------------
(function() {
  var userAgent    = navigator.userAgent.toLowerCase(),
      // Safari sometimes randomly crashes when playing sound
      audioIsBuggy = (userAgent.indexOf("safari") !== -1 && userAgent.indexOf("chrome") === -1);
  if (!window.Audio || audioIsBuggy) {
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
