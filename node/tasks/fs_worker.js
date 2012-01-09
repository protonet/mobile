var fs              = require('fs'),
    path            = require('path'),
    util            = require('util'),

    Step            = require('../modules/step'),
    lookup_mime     = require('../modules/node-mime').lookup,

    ROOT_DIR        = './../shared/files',
    PERMISSIONS     = 416; // 0640 (rw-r-----)


function isLink(path) {
  return (fs.lstatSync(path).mode & 8192) > 0;
}

// The parameters are a random throwback to my days browsing the PHP docs.
function startsWith(haystack, needle) {
  return haystack.slice(0, needle.length) == needle;
}

// Takes a filesystem path, returns true if it should be symlink
function shouldBeLink(fs_path) {
  return startsWith(path.relative(ROOT_DIR, fs_path), 'channels');
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
      fs.chmod(target, PERMISSIONS);
      reply(null, true);
    });
  });
}

function copyTo(source, target, reply) {
  if (getType(target) == 'dir') {
    target = path.join(target, path.basename(source));
  }

  while (isLink(source)) {
    source = path.join(path.dirname(source), fs.readlinkSync(source));
  }

  if (getType(source) == 'dir') {
    fs.mkdirSync(target);

    var files = fs.readdirSync(source);
    for (var i in files) {
      copyTo(path.join(source, files[i]), path.join(target, files[i]), reply);
    }
  } else {
    if (shouldBeLink(target)) {
      var symlink = path.relative(path.dirname(target), source);

      try {
        console.log('linking ' + target + ' to ' + symlink);
        fs.symlink(symlink, target, function() {
          fs.chmod(target, PERMISSIONS);
          reply(null, true);
        });
      } catch(e) {}
    } else {
      lowLevelCopy(source, target, reply);
    }
  }
}

function copyManyTo(sources, target, reply) {
  if ((sources.length > 1) && (getType(target) != 'dir')) {
    return null; // TODO: error
  }

  Step(function() {
    for (var i in sources) {
      copyTo(sources[i], target, this.parallel());
    }
  }, reply);
}

function moveTo(source, target, reply) {
  if (shouldBeLink(target)) {
    copyTo(source, target, function(err) {
      if (isLink(source)) {
        console.log('unlinking ' + source);
        fs.unlink(source, reply);
      } else {
        reply(err, true);
      }
    });
  } else {
    if (getType(target) == 'dir') {
      target = path.join(target, path.basename(source));
    }

    if (isLink(source)) {
      copyTo(source, target, function(err) {
        console.log('unlinking ' + source);
        fs.unlink(source, reply);
      });
    } else {
      while (isLink(source)) {
        source = path.join(path.dirname(source), fs.readlinkSync(source));
      }

      console.log('renaming ' + source + ' to ' + target);
      fs.rename(source, target, reply);
    }
  }
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
  if (getType(target) == 'dir') {
    fs.readdir(target, function(err, files) {
      if (files.length == 0) {
        console.log('removing empty dir ' + target);
        fs.rmdir(target, reply);
      } else {
        Step(function() {
          for (var i in files) {
            remove(path.join(target, files[i]), this.parallel());
          }
        }, function() {
          console.log('removing dir ' + target);
          fs.rmdir(target, reply);
        });
      }
    });
  } else {
    console.log('unlinking ' + target);
    fs.unlink(target, reply);
  }
}


exports.list = function(params, reply) {
  var dir = path.join(ROOT_DIR, params.parent);

  fs.readdir(dir, function(err, filelist) {
    var files = {};

    for (var file in filelist) {
      var fullpath = path.join(dir, filelist[file]);

      var stats = fs.statSync(fullpath);
      if (stats.isDirectory()) {
        files[filelist[file]] = {
          created: stats.ctime,
          type:    'folder'
        };
      } else {
        files[filelist[file]] = {
          size:  stats.size,
          added: stats.ctime,
          mime:  lookup_mime(filelist[file]),
          type:  'file'
        };
      }
    }

    reply(err, files);
  });
};

exports.move = function(params, reply) {
  if (!params.to || !params.from || params.from.length < 1) {
    return reply();
  }

  var target = path.join(ROOT_DIR, params.to);
  var sources = [];

  for (var i in params.from) {
    sources[i] = path.join(ROOT_DIR, params.from[i]);
  }

  moveManyTo(sources, target, reply);
};

exports.copy = function(params, reply) {
  if (!params.to || !params.from || params.from.length < 1) {
    return reply();
  }

  var target = path.join(ROOT_DIR, params.to);
  var sources = [];

  for (var i in params.from) {
    sources[i] = path.join(ROOT_DIR, params.from[i]);
  }

  copyManyTo(sources, target, reply);
};

exports.delete = function(params, reply) {
  Step(function() {
    for (var i in params.paths) {
      // TODO: don't want a bad person who found a bug to just rm the
      // whole store but this isn't good either
      if (params.paths[i].split('/').length >= 3) {
        var file = path.join(ROOT_DIR, params.paths[i]);
        remove(file, this.parallel());
      }
    }
  }, reply);
};

exports.mkdir = function(params, reply) {
  var dir;
  if (params.path) {
    dir = path.join(ROOT_DIR, params.path);
  } else {
    dir = path.join(ROOT_DIR, params.parent, params.name);
  }

  fs.mkdir(dir, reply);
};

exports.info = function(params, reply) {
  var results = {};

  for (var i in params.paths) {
    var info;

    try {
      var file = path.join(ROOT_DIR, params.paths[i]);

      var stat = fs.statSync(file);
      var lstat = fs.lstatSync(file);

      if (stat.isDirectory()) {
        info = {
          type: 'folder'
        };
      } else {
        info = {
          size: stat.size,
          mime: lookup_mime(params.paths[i]),
          type: 'file'
        };
      }

      info.uploaded =  stat.ctime.getTime();
      info.added    = lstat.ctime.getTime();

      var real = file;
      while (isLink(real)) {
        real = path.join(path.dirname(real), fs.readlinkSync(real));
      }

      var parts = path.relative(ROOT_DIR, real).split('/');
      if (parts.length > 1) {
        info.uploader = Number(parts[1]);
      }
    } catch(ex) {
      info = { type: 'missing' };
    }

    results[params.paths[i]] = info;
  }

  reply(null, results);
};
