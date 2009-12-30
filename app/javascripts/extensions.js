//---------------------------- CONSOLE ----------------------------
if (!console) {
  var console = { log: function() {} };
}



//---------------------------- FUNCTION ----------------------------
Function.prototype.bind = function () {
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




//---------------------------- NUMBER ----------------------------
Number.prototype.px = function() {
  return this + "px";
};




//---------------------------- HTML5 FILE ----------------------------
if (typeof(File) == "object") {
  
  File.prototype.asObject = function() {
    return { id: this.getId(), name: this.fileName, size: this.fileSize };
  };
  
  File.prototype.getId = function() {
    return this.fileSize + "-" + this.fileName.replace(/[^a-z0-9]/gi, "");
  };
  
}