//---------------------------- CONSOLE ----------------------------
if (typeof(console) == "undefined" || typeof(console.log) != "function") {
  console = { log: function() {} };
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
Array.prototype.chunk = (function() {
  var DELAY = 50,
      MAX_EXECUTION_TIME = 50;
  return function(iterator, callback) {
    var arr = this, i = 0, iterationLength = arr.length, time;
    var perform = function() {
      time = new Date();
      while (i<iterationLength) {
        iterator(arr[i], i);
        i++;
        if ((new Date() - time) > MAX_EXECUTION_TIME) {
          /** Breathe */
          setTimeout(function() { perform(); }, DELAY);
          return;
        }
      }
      callback && setTimeout(callback, DELAY);
    };
    perform();
  };
})();




//---------------------------- STRING ----------------------------
String.prototype.startsWith = function(str) {
  return this.indexOf(str) === 0;
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




//---------------------------- NUMBER ----------------------------
Number.prototype.px = function() {
  return this + "px";
};




//---------------------------- HTML5 FILE ----------------------------
if (/object|function/.test(typeof(File))) {
  File.prototype.asObject = function() {
    return { id: this.getId(), name: this.fileName, size: this.fileSize };
  };
  
  File.prototype.getId = function() {
    return this.fileSize + "-" + this.fileName.replace(/[^a-z0-9]/gi, "");
  };
}