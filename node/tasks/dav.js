var jsDAV  = require('jsDAV');
var jsLock = require('jsDAV/lib/DAV/plugins/locks/fs');

var crypto = require('crypto');
var http   = require('http');

exports.realm = 'protonet at ' + require('os').hostname();

// defaults to localhost
//exports.server = 'team.protonet.info';

var store = {
  storage: {},
  
// TODO: use a grace period so live connections won't drop suddenly
/*  timer: setInterval(function () {
    var now = Number(new Date());
    store.storage = {};
  }, 30000),*/

  grab: function (username) {
    var key = 'user-' + username;
    var entry = store.storage[key];
      
    if (!entry) {
      store.storage[key] = entry = {
        username: username,
        digest: '',
        dav: undefined
      };
    }
    
    entry.lastHit = Number(new Date());
    return entry;
  }
};

function md5 (source) {
  return crypto.createHash('md5').update(source).digest('hex');
}

var checkCreds = function (username, password, callback) {
  var cache = store.grab(username);
  var creds = username + ':' + password;
  var digest = md5(creds);
  
  if (cache.digest == digest) {
    //console.log('Cache approved ' + cache.username);
    return callback(cache);
  }
  
  var options = {
    hostname: exports.server || 'localhost',
    path: '/api/v1/users/find_by_login/' + username,
    auth: creds
  }
  
  console.log('Checking credentials against upstream...');
  http.get(options, function (res) {
      if (res.statusCode == 401) {
        return callback(false);
      } else if (res.statusCode != 200) {
        console.log('Weird status code ' + res.statusCode +
                   ' encountered while querying the protonet API');
        return callback(undefined);
      }
      
      var data = '';
      
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        data += chunk;
      });
      
      res.on('end', function () {
        if (JSON.parse(data).login == username) {
          console.log('Updating cached hash for ' + cache.username);
          cache.digest = digest;
          callback(cache);
        } else {
          console.log('Something freaky just happened:', JSON.parse(data), username);
          return callback(undefined);
        }
      });
  });
};

var requireAuth = function(res) {
  console.log('Asking client for auth');
  
  res.writeHead(401, {"WWW-Authenticate": "Basic realm=\"" + exports.realm + "\""});
  res.end();
};

var authenticate = function(req, res, callback) {
  var auth = req.headers["authorization"];
  if (!auth || auth.toLowerCase().indexOf("basic") !== 0)
    return requireAuth(res);

  var userpass = (new Buffer(auth.substr(6), "base64")).toString("utf8").split(":");
  if (!userpass.length)
    return requireAuth(res);

  // Authenticates the user
  checkCreds(userpass[0], userpass[1], function(cache) {
    if (!cache)
      return requireAuth(res);

    callback(cache);
  });
};

exports.handle = function (req, res) {
  console.log(req.method + " \t" + req.url);
  
  // needed or jsDAV refuses it based on the mountpoint
  if (req.url == '/dav')
    req.url += '/';
  
  authenticate(req, res, function (cache) {
    console.log('Authed as ' + cache.username);
    
    // Reject path-breaking attempts
    if (!cache.username.match(/^[^\.\/][^\/]*$/)) {
      console.log('Rejecting username');
      return requireAuth(res);
    }

    if (!(cache.dav)) {
      var fsPath = '/home/protonet/dashboard/shared/files/system_users/' + cache.username;

      var options = {
        node: fsPath,
        locksBackend: new jsLock(fsPath + '/.locks'),
        mount: '/dav/',
        server: {},
        standalone: false
      };
      
      console.log('Creating jsDAV mount for ' + cache.username);
      cache.dav = jsDAV.mount(options);
    }
    
    cache.dav.exec(req, res);
  });
};

