//= require "../ui/notification.js"

/**
 * User Model
 *
 * A full user object must contain:
 *    id, name, avatar, isAdmin, isOnline, isStranger, isViewer
 *
 * @example
 *    // Retrieve user with id 1
 *    protonet.data.User.get(1, function(user) { alert("Hello, " +  user.name); });
 *    // => { id: 1, name: "tiff", avatar: "/foo.jpg", isOnline: true, isStranger: false, isViewer: true }
 *    
 *    // Retrieve user id of user with name "tiff"
 *    protonet.data.User.getIdByName("tiff")
 *    // => 1
 *
 *    // Get user ids of all administrators
 *    protonet.data.User.getAdmins();
 *    // => [1, 15]
 *
 *    // Check if a certain user is online
 *    protonet.data.User.isOnline(32);
 *    // => true
 *
 *    // Store a setting at the current user
 *    protonet.data.User.setPreference("sound", true);
 *
 *    // Retrieve a setting
 *    protonet.data.User.getPreference("sound");
 *    // => true
 */
(function(protonet) {
  var undef,
      REG_EXP_CHANNEL_ID  = /^\/channels\/(\d+)\/.*$/,
      dataCache           = {},
      viewerId            = protonet.config.user_id,
      viewerName          = protonet.config.user_name,
      defaultAvatar       = protonet.config.default_avatar,
      adminIds            = protonet.config.admin_ids,
      userArr             = protonet.config.users,
      nameToIdMapping     = {},
      idToNameMapping     = {},
      preferencesConfig   = {
        sound: {
          type: "boolean",
          labels: {
            "true":   "sound <span class=\"on\">on</span>",
            "false":  "sound <span class=\"off\">off</span>"
          },
          defaultValue: true
        },
        smilies: {
          type: "boolean",
          labels: {
            "true":  "smilies <span class=\"on\">on</span>",
            "false": "smilies <span class=\"off\">off</span>"
          },
          defaultValue: true
        }
      };
      
  // Webkit Notifications for replies
  if (protonet.ui.Notification.supported()) {
    preferencesConfig.reply_notification = {
      type: "notification",
      labels: {
        "true":  "reply notifications <span class=\"on\">on</span>",
        "false": "reply notifications <span class=\"off\">off</span>"
      },
      defaultValue: protonet.ui.Notification.hasPermission()
    };
  }
  
  // Store current user first.
  cache({
    name:   viewerName,
    id:     viewerId,
    avatar: defaultAvatar
  });
  
  function prepareParameters(options) {
    if (typeof(options) === "function") {
      options = { success: options };
    }
    return $.extend({ bypassCache: false, success: $.noop, error: $.noop, complete: $.noop }, options);
  }
  
  function cache(user) {
    var oldUser = dataCache[user.id],
        oldAvatar,
        oldIsOnline;
    
    // Make sure to preserve old avatar, since old meeps could contain false information
    if (oldUser && oldUser.avatar !== defaultAvatar) {
      oldAvatar = oldUser.avatar;
    }
    
    // Make sure to preserve old avatar, since old meeps could contain false information
    if (oldUser) {
      oldIsOnline = oldUser.isOnline;
    }
    
    $.extend(user, {
      isAdmin:    adminIds.indexOf(user.id) !== -1,
      isViewer:   user.id == viewerId,
      isStranger: user.name.match(/^guest\..+$/),
      isOnline:   oldIsOnline !== undef ? oldIsOnline : false,
      avatar:     oldAvatar || user.avatar || defaultAvatar
    });
    
    dataCache[user.id] = user;
    
    nameToIdMapping[user.name.toLowerCase()] = user.id;
    idToNameMapping[user.id] = user.name;
    
    protonet.trigger("user.data_available", user);
  }
  
  function cacheUserFromMeep(meep) {
    cache({
      id: meep.user_id,
      name: meep.author,
      avatar: meep.avatar
    });
  }
  
  $.each(userArr, function(i, user) {
    cache(user);
  });
  
  
  // Subscribe to a bunch of socket events that contain user information
  protonet.on("meep.receive meep.sent", function(meep) {
    cacheUserFromMeep(meep);
  });
  
  protonet.on("user.added", cache);
  
  protonet.on("user.changed_avatar", function(data) {
    var user = dataCache[data.id];
    if (user) {
      user.avatar = data.avatar || defaultAvatar;
    }
  });
  
  protonet.on("channel.initialized", function(channel) {
    $.each(channel.meeps, function(i, meep) {
      cacheUserFromMeep(meep);
    });
  });
  
  protonet.on("users.update_admin_status", function(data) {
    adminIds = data.admin_ids;
    $.each(dataCache, function(id, user) {
      user.isAdmin = adminIds.indexOf(+id) !== -1;
    });
  });
  
  protonet.on("users.update_status", function(data) {
    $.each(dataCache, function(i, user) {
      user.isOnline = false;
    });
    
    $.each(data.online_users, function(i, user) {
      cache(user);
      user.isOnline = true;
    });
  });
  
  protonet.on("user.came_online", function(user) {
    // TODO: sometimes user.came_online is triggered with an invalid user name
    if (!user.name) {
      return;
    }
    
    cache(user);
    user.isOnline = true;
  });
  
  protonet.on("user.goes_offline", function(data) {
    var user = dataCache[data.id];
    if (user) {
      user.isOnline = false;
    }
  });
  
  protonet.on("socket.disconnected", function(data) {
    $.each(dataCache, function(i, user) {
      user.isOnline = false;
    });
  });
  
  protonet.data.User = {
    get: function(id, options) {
      options = prepareParameters(options);
      
      // TODO: We cannot load data for remote users from the server
      var isRemote = String(id).indexOf("_") !== -1;
      if (isRemote) {
        var user = dataCache[id];
        user ? options.success(user) : options.error({});
        return;
      }
      
      var originalSuccess = options.success;
      options.success = function(data) {
        originalSuccess(data[0]);
      };
      
      this.getAll([id], options);
    },
    
    getAll: function(ids, options) {
      options = prepareParameters(options);
      
      var uncachedIds = [],
          results     = [];
      
      $.each(ids, function(i, id) {
        var cached = dataCache[id];
        if (cached && !options.bypassCache) {
          results.push(cached);
        } else {
          uncachedIds.push(id);
        }
      });
      
      if (!uncachedIds.length) {
        options.success(results);
      } else {
        $.ajax({
          dataType: "json",
          url:  "/users/info",
          data: { ids: uncachedIds.join(","), _: 1 },
          success:  function(data) {
            $.each(data, function(i, user) {
              cache(user);
            });
            results = results.concat(data);
            options.success(results);
          },
          error:    function(xhr) {
            options.error(xhr);
          },
          complete: function(xhr) {
            options.complete(xhr);
          }
        });
      }
    },
    
    getCache: function() {
      return dataCache;
    },
    
    getName: function(id) {
      return idToNameMapping[id];
    },
    
    getUrl: function(id) {
      return protonet.config.base_url + "/users/" + id;
    },
    
    getAvatar: function(id) {
      var user = dataCache[id];
      return user ? user.avatar : defaultAvatar;
    },
    
    getIdByName: function(name) {
      return nameToIdMapping[name.toLowerCase()];
    },
    
    getFolder: function(id) {
      return "/users/" + id + "/";
    },
    
    isViewer: function(id) {
      return id == viewerId;
    },
    
    isOnline: function(id) {
      var user = dataCache[id];
      return user ? user.isOnline : false;
    },
    
    isStranger: function(id) {
      var user = dataCache[id];
      return user ? user.isStranger : true;
    },
    
    isAdmin: function(id) {
      return adminIds.indexOf(id) !== -1;
    },
    
    hasSubscribedToChannel: function(userId, channelId) {
      return protonet.data.Channel.isSubscribedByUser(channelId, userId);
    },
    
    getPreference: function(key) {
      var value       = protonet.storage.get(key),
          preference  = preferencesConfig[key];

      if (preference && preference.type === "notification") {
        if (!protonet.ui.Notification.hasPermission()) {
          return false;
        }
      }

      if (typeof(value) !== "undefined" && value !== null) {
        return JSON.parse(value);
      } else {
        return preference && preference.defaultValue;
      }
    },
    
    getCurrent: function() {
      return dataCache[viewerId];
    },
    
    getAdmins: function() {
      return adminIds;
    },
    
    // Returns an admin who's currently online
    // ... or if nobody's available the first one
    getAvailableAdmin: function(id) {
      var i               = 0,
          length          = adminIds.length,
          availableAdmin  = adminIds[0];
      for (; i<length; i++) {
        if (dataCache[adminIds[0]].isOnline) {
          availableAdmin = adminIds[0];
          break;
        }
      }
      return availableAdmin;
    },
    
    setPreference: function(key, value) {
      protonet.storage.set(key, value);
    },
    
    getPreferencesConfig: function() {
      return preferencesConfig;
    },
    
    // ----------- USER RIGHTS ---------- \\
    hasWriteAccessToFile: function(userId, path) {
      var userFilesPath = "/users/" + userId + "/",
          // parse channel id from path
          channelId     = +(path.match(REG_EXP_CHANNEL_ID) || [, NaN])[1];
      
      // strangers can't delete or upload
      if (this.isStranger(userId)) {
        return false;
      }
      
      return this.isAdmin(userId)                                           // admin has access to everything
        || path.startsWith(userFilesPath)                                   // is viewer's file space
        || (channelId && this.hasSubscribedToChannel(userId, channelId));   // is subscribed by user;
    },
    
    hasReadAccessToFile: function(userId, path) {
      var userFilesPath = "/users/" + userId + "/",
          // parse channel id from path
          channelId     = +(path.match(REG_EXP_CHANNEL_ID) || [, NaN])[1];
      
      return this.isAdmin(userId)                                           // admin has access to everything
        || path.count("/") < 3                                              // /, /users/, /channels/, /foo/, ...
        || path.startsWith(userFilesPath)                                   // is viewer's file space
        || (!path.startsWith("/users/") && !path.startsWith("/channels/"))  // any other root tree can be accessed (eg. /info/foo/bar.gif)
        || (channelId && this.hasSubscribedToChannel(userId, channelId));   // is subscribed by user;
    }
  };
  
})(protonet);