var _                   = require('underscore')._,
    fs                  = require('fs'),
    path                = require('path'),
    util                = require('util'),
    Step                = require('step'),
    xattr               = require('xattr'),
    lookupMime          = require('mime').lookup,
    
    watch               = require("watch"),
    timeouts            = {},
    
    REG_EXP_CHANNEL     = /^channels\/(\d+)(\/|$)/,
    ANONYMOUS           = -1,
    ROOT_DIR            = global.FILES_PATH,
    FILE_PERMISSIONS    = 432, // 0660
    FOLDER_PERMISSIONS  = 504; // 0770



function getChannelId(fsPath) {
  var relativePath = path.relative(ROOT_DIR, fsPath),
      channelId    = (relativePath.match(REG_EXP_CHANNEL) || [])[1];
  return +channelId;
}

function getChannelPath(id) {
  return path.join(ROOT_DIR, "channels", String(id));
}

function grepError(arr) {
  for (var i=0; i<arr.length; i++) {
    if (arr[i] instanceof Error) {
      // Hide other error information
      return arr[i];
    }
  }
}

// The frontend expects a path relative to the ROOT_DIR
// Also folder paths should always end with a "/"
function absolutePathForFrontend(absolutePath) {
  var relativePath = "/" + path.relative(ROOT_DIR, absolutePath);
  if (relativePath.slice(-1) !== "/" && absolutePath.slice(-1) === "/") {
    relativePath += "/";
  }
  return relativePath;
}

// Hide potential sensitive information from the user
function errorForFrontend(error) {
  return error.code;
}

function mergePathObjects(arr) {
  var result = {};
  arr.forEach(function(obj) {
    for (var i in obj) {
      result[absolutePathForFrontend(i)] = absolutePathForFrontend(obj[i]);
    }
  });
  return result;
}

function createResponseForCopy(source, target) {
  var response = {};
  response[source] = target;
  return response;
}

function getOwner(fsPath) {
  var parts = path.relative(ROOT_DIR, fsPath).split('/');
  if (parts[0] === "users" && !isNaN(+parts[1])) {
    return +parts[1];
  } else {
    return +(xattr.list(fsPath)["user.owner"]) || ANONYMOUS;
  }
}

// The parameters are a random throwback to my days browsing the PHP docs.
function startsWith(haystack, needle) {
  return haystack.slice(0, needle.length) == needle;
}

// Takes a filesystem path, returns true if it should be symlink
function shouldBeLink(fsPath) {
  var channelId = getChannelId(fsPath);
  return !!channelId;
}

function getType(path) {
  try {
    return ((fs.statSync(path).mode & 16384) > 0) ? 'dir' : 'file';
  } catch(ex) { return null; }
}

// Low-level copy operation helper.
function lowLevelCopy(source, target, reply) {
  var newFile, oldFile;

  console.log('copying ' + source + ' to ' + target);

  oldFile = fs.createReadStream(source);
  newFile = fs.createWriteStream(target);

  newFile.once('open', function(fd){
    util.pump(oldFile, newFile, function(err) {
      fs.chmod(target, FILE_PERMISSIONS);
      reply(null, true);
    });
  });
}

function copyTo(source, target, reply) {
  if (getType(target) == 'dir') {
    target = path.join(target, path.basename(source));
  }
  
  if (getType(source) == 'dir') {
    fs.mkdirSync(target, FOLDER_PERMISSIONS);

    var files = fs.readdirSync(source);
    for (var i in files) {
      copyTo(path.join(source, files[i]), path.join(target, files[i]), reply);
    }
  } else {
    if (shouldBeLink(target)) {
      console.log('linking ' + target + ' to ' + source);
      
      if (target === source) {
        return reply(null, createResponseForCopy(source, target));
      }
      
      try {
        // Override if necessary
        fs.unlinkSync(target);
      } catch(e) {}
      
      fs.link(source, target, function(err) {
        fs.chmod(target, FILE_PERMISSIONS);
        if (err) {
          reply(err, createResponseForCopy(source, target));
        } else {
          reply(null, createResponseForCopy(source, target));
        }
      });
    } else {
      lowLevelCopy(source, target, function() {
        reply(null, createResponseForCopy(source, target));
      });
    }
  }
}

function copyManyTo(sources, target, reply) {
  if ((sources.length > 1) && (getType(target) != 'dir')) {
    return; // TODO: error
  }
  
  Step(function() {
    for (var i in sources) {
      copyTo(sources[i], target, this.parallel());
    }
  }, function() {
    var result = _.toArray(arguments);
    result = _.compact(result);
    var error = grepError(result);
    if (error) {
      reply(errorForFrontend(error), {});
    } else {
      reply(null, mergePathObjects(result));
    }
  });
}

function moveTo(source, target, reply) {
  if (getType(target) == 'dir') {
    target = path.join(target, path.basename(source));
  }
  
  console.log("move " +  source + " to " + target);
  fs.rename(source, target, reply);
}

function moveManyTo(sources, target, reply) {
  if ((sources.length > 1) && (getType(target) != 'dir')) {
    return null; // TODO: error
  }

  Step(function() {
    for (var i in sources) {
      moveTo(sources[i], target, this.parallel());
    }
  }, reply);
}

function remove(target, reply) {
  var replyWrapper = function() {
    reply(null, absolutePathForFrontend(target));
  };
  
  if (getType(target) == 'dir') {
    fs.readdir(target, function(err, files) {
      if (files.length == 0) {
        fs.rmdir(target, replyWrapper);
      } else {
        Step(function() {
          for (var i in files) {
            remove(path.join(target, files[i]), this.parallel());
          }
        }, function() {
          console.log('removing dir ' + target);
          fs.rmdir(target, replyWrapper);
        });
      }
    });
  } else {
    console.log('unlinking ' + target);
    fs.unlink(target, replyWrapper);
  }
}

// recursively walk the dom tree and collect file information
function walk(dir, reply) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) {
      return reply(err);
    }
    
    var pending = list.length;
    if (!pending) {
      return reply(null, results);
    }
    
    list.forEach(function(fileName) {
      var path = dir + '/' + fileName;
      fs.stat(path, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(path, function(err, res) {
            results = results.concat(res);
            if (!--pending) {
              reply(null, results);
            }
          });
        } else {
          if (stat) {
            if (fileName.charAt(0) !== ".") {
              results.push({
                name:     fileName,
                path:     absolutePathForFrontend(path),
                size:     stat.size,
                type:     "file",
                mime:     lookupMime(fileName),
                modified: Math.max(stat.ctime, stat.mtime)
              });
            }
          }
          
          if (!--pending) { 
            reply(null, results);
          }
        }
      });
    });
  });
}

exports.lastModified = function(params, reply) {
  var parent = path.join(ROOT_DIR, params.parent);
  
  walk(parent, function(err, results) {
    if (err) {
      return reply(err, []);
    }
    
    var total = results.length;
    
    results.sort(function(file1, file2) {
      return file1.modified - file2.modified;
    });
    
    results.reverse();
    
    results = results.slice(0, 4);
    
    reply(null, { files: results, total: total });
  });
};

exports.list = function(params, reply) {
  var dir = path.join(ROOT_DIR, params.parent);
  fs.readdir(dir, function(err, fileList) {
    var files = [];
    
    for (var i in fileList) {
      var fileName    = fileList[i],
          fullPath    = path.join(dir, fileName);
      
      // Ignore files starting with a "."
      if (fileName.charAt(0) === ".") {
        continue;
      }
      
      try {
        var stats = fs.statSync(fullPath);
      } catch(e) {
        continue;
      }
      
      if (stats.isDirectory()) {
        file = {
          name:     fileName,
          modified: stats.mtime,
          type:     "folder"
        };
      } else {
        file = {
          name:     fileName,
          size:     stats.size,
          modified: stats.mtime,
          mime:     lookupMime(fileName),
          type:     "file"
        };
      }
      
      file.path = path.join(params.parent, fileName);
      if (file.type === "folder") {
        file.path += "/";
      }
      files.push(file);
    }
    reply(err, files);
  });
};

exports.move = function(params, reply) {
  if (!params.to || !params.from || params.from.length < 1) {
    return reply(null, {});
  }

  var target = path.join(ROOT_DIR, params.to);
  var sources = [];

  for (var i in params.from) {
    if (params.from[i] !== params.to) {
      sources[i] = path.join(ROOT_DIR, params.from[i]);
    }
  }
  
  moveManyTo(sources, target, reply);
};

exports.copy = function(params, reply) {
  if (!params.to || !params.from || params.from.length < 1) {
    return reply(null, {});
  }

  var target = path.join(ROOT_DIR, params.to);
  var sources = [];

  for (var i in params.from) {
    sources[i] = path.join(ROOT_DIR, params.from[i]);
  }
  
  copyManyTo(sources, target, reply);
};

exports.remove = function(params, reply) {
  Step(function() {
    for (var i in params.paths) {
      // TODO: don't want a bad person who found a bug to just rm the
      // whole store but this isn't good either
      var file = path.join(ROOT_DIR, params.paths[i]);
      remove(file, this.parallel());
    }
  }, function() {
    var result = _.toArray(arguments);
    result = _.compact(result);
    reply(null, result);
  });
};

exports.mkdir = function(params, reply) {
  var dir = path.join(ROOT_DIR, params.parent, params.name);

  fs.mkdir(dir, FOLDER_PERMISSIONS, reply);
};

exports.info = function(params, reply) {
  var results = [];

  for (var i in params.paths) {
    var info;

    try {
      var file = path.join(ROOT_DIR, params.paths[i]);

      var stat = fs.statSync(file);

      if (stat.isDirectory()) {
        info = {
          type: 'folder'
        };
      } else {
        info = {
          size: stat.size,
          mime: lookupMime(params.paths[i]),
          type: 'file'
        };
      }
      
      info.name         = path.basename(params.paths[i]);
      info.path         = params.paths[i];
      info.modified     = stat.mtime;
      info.uploader_id  = getOwner(file);
    } catch(ex) {
      info = {
        type: 'missing',
        path: params.paths[i]
      };
    }

    results.push(info);
  }

  reply(null, results);
};


exports.init = function(amqpConnection) {
  var channelExchange = amqpConnection.exchange("channels"),
      fsWorker        = this;
  
  watch.createMonitor(ROOT_DIR, function(monitor) {
    function push(fsPath) {
      var channelId = getChannelId(fsPath);
      
      if (!channelId) { return; }
      
      var channelPath = getChannelPath(channelId),
          channelUuid = xattr.list(channelPath)["user.uuid"];
      
      if (!channelUuid) { return; }
      
      fsWorker.lastModified({ parent: absolutePathForFrontend(channelPath) }, function(err, data) {
        if (!err) {
          channelExchange.publish("channels." + channelUuid, {
            trigger: "channel.update_files",
            id:      channelId,
            files:   data.files,
            total:   data.total
          });
        }
      });
    }

    monitor.on("created", function (fsPath, stat) {
      clearTimeout(timeouts[stat.ino]);
      delete timeouts[stat.ino];

      push(fsPath);
    });

    monitor.on("changed", function (fsPath, curr, prev) {
      push(fsPath);
    });

    monitor.on("removed", function (fsPath, stat) {
      timeouts[stat.ino] = setTimeout(function() {
        delete timeouts[stat.ino];
        push(fsPath);
      }, 500);
    });
  });
};