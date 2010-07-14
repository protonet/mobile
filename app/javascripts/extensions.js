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




//---------------------------- DATE ----------------------------
/**
 * Converts ISO8601/RFC3339 into a readable js date
 * Taken from http://blog.dansnetwork.com/2008/11/01/javascript-iso8601rfc3339-date-parser/
 * (slightly modified for better performance)
 */
Date.prototype.setISO8601 = (function() {
  var REG_EXP = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;
  return function(dString) {
    if (dString.toString().match(REG_EXP)) {
      var d = dString.match(REG_EXP);
      var offset = 0;
      this.setUTCDate(1);
      this.setUTCFullYear(parseInt(d[1],10));
      this.setUTCMonth(parseInt(d[3],10) - 1);
      this.setUTCDate(parseInt(d[5],10));
      this.setUTCHours(parseInt(d[7],10));
      this.setUTCMinutes(parseInt(d[9],10));
      this.setUTCSeconds(parseInt(d[11],10));
      if (d[12]) {
        this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
      } else {
        this.setUTCMilliseconds(0);
      }
      if (d[13] != 'Z') {
        offset = (d[15] * 60) + parseInt(d[17],10);
        offset *= ((d[14] == '-') ? -1 : 1);
        this.setTime(this.getTime() - offset * 60 * 1000);
      }
    } else {
      this.setTime(Date.parse(dString));
    }
    return this;
  };
})();