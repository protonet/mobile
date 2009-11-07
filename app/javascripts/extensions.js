//---------------------------- CONSOLE ----------------------------
if (!window.console) {
  var console = { log: function(){} };
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



//---------------------------- HTML5 FILE ----------------------------
if (typeof(File) == "object") {
  
  File.prototype.asObject = function() {
    return { id: this.getId(), name: this.fileName, size: this.fileSize };
  };
  
  File.prototype.getId = function() {
    return this.fileSize + "-" + this.fileName.replace(/[^a-z0-9]/gi, "");
  };
  
}