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
    return obj.stripMetaData().colorSpace('RGB').resample(72).resize(width, height).extent(width, height).gravity("center").background("none");
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
  obj.resample = function(dpi) {
    return obj.makeArgs(["-resample", dpi], null);
  };
  obj.colorSpace = function(space) {
    return obj.makeArgs(["-colorspace", space], null);
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
  obj.write = function(out, successCallback, errorCallback) {
    obj.inArgs.push(obj.input); 
    obj.outArgs.push(out);
    var args = obj.inArgs.concat(obj.outArgs);
    obj.__run("convert", args, successCallback, errorCallback);
  };
  obj.__run = function (cmd, args, successCallback, errorCallback) {
    args.unshift(cmd);
    cmd = "convert";
    sys.puts("running command: " + args.join(" "));
    var p = childProcess.exec((args.join(" ")), function(error, stdout, stderr) {
      if (error !== null) {
        errorCallback();
      } else {
        successCallback();
      }
    });
  };
  return obj;
};