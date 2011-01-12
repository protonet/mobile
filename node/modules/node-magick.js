var sys = require('sys');
var childProcess = require('child_process');

exports.createCommand = function(input) { 
  return magickCommand({input: input}); 
};

var magickCommand = function(obj) {
  obj.inArgs = [];
  obj.outArgs = [];
  obj.cropResize = function(width, height) {
    return obj.crop(width, height).resize(width, height);
  };
  obj.resizeMagick = function(width, height) {
    return obj.resize(width, height).extent(width, height).gravity("center").background("none").stripMetaData();
  };
  obj.resize = function(width, height) {
    var wh = width + "x" + height + "^";
    return obj.makeArgs(["-resize", wh], null);
  };
  obj.crop = function(width, height) {
    var wh = width + "x" + height;
    return obj.makeArgs(["-crop", wh], null);
  };
  obj.extent = function(width, height) {
    var wh = width + "x" + height;
    return obj.makeArgs(["-extent", wh], null);
  };
  obj.gravity = function(point) {
    return obj.makeArgs(["-gravity", point], null);
  };
  obj.background = function(color) {
    return obj.makeArgs(["-background", color], null);
  };
  obj.stripMetaData = function() {
    return obj.makeArgs(["-strip"], null);
  };
  obj.makeArgs = function(inargs, outargs) {
    if (arguments.length == 1) {
      outargs = inargs;
      inargs = null;
    }
    if (inargs) {
      obj.inArgs = obj.inArgs.concat(inargs);
    }
    if (outargs) {
      obj.outArgs = obj.outArgs.concat(outargs);
    }
    return obj;
  };
  obj.write = function(out, callback) {
    obj.inArgs.push(obj.input); 
    obj.outArgs.push(out);
    var args = obj.inArgs.concat(obj.outArgs);
    obj.__run("convert", args, callback);
  };
  obj.__run = function (cmd, args, callback) {
    args.unshift(cmd);
    cmd = "convert";
    sys.puts("running command: " + cmd + " " + args.join(" "));
    var p = childProcess.exec((cmd + " " + args.join(" ")), function(error, stdout, stderr) {
      callback();
    });
  };
  return obj;
};