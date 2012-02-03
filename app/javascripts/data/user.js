//= require "../ui/notification.js"

/**
 * User Model
 *
 * A full user object must contain:
 *    id, name, avatar, isAdmin, isOnline, isStranger, isViewer
 *
 * @example
 *    // Retrieve user with id 1
 *    protonet.data.User.get(1)
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
  
  var dataCache       = {},
      viewerId        = protonet.config.user_id,
      viewerName      = protonet.config.user_name,
      defaultAvatar   = protonet.config.default_avatar,
      adminIds        = protonet.config.admin_ids,
      userArr         = protonet.config.users,
      nameToIdMapping = {},
      idToNameMapping = {},
      preferences     = {
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
    preferences.reply_notification = {
      type: "notification",
      labels: {
        "true":  "reply notifications <span class=\"on\">on</span>",
        "false": "reply notifications <span class=\"off\">off</span>"
      },
      defaultValue: protonet.ui.Notification.hasPermission()
    };
  }
  
  // Store current user first.
  nameToIdMapping[viewerName.toLowerCase()] = viewerId;
  idToNameMapping[viewerId] = viewerName;
  
  function cache(user) {
    $.extend(user, {
      isAdmin:    adminsIds.indexOf(user.id) !== -1,
      isViewer:   user.id == viewerId,
      isStranger: user.name.startsWith("stranger_"),
      isOnline:   false
    });
    
    user.avatar = user.avatar || defaultAvatar;
    
    dataCache[user.id] = user;
    
    nameToIdMapping[user.name.toLowerCase()] = user.id;
    idToNameMapping[user.id] = user.name;
  }
  
  $.each(userArr, function(i, user) {
    cache(user);
  });
  
  
  // Subscribe to a bunch of socket events that contain user information
  protonet.on("meep.receive meep.sent", function(meep) {
    nameToIdMapping[meep.author.toLowerCase()] = meep.user_id;
    idToNameMapping[meep.user_id] = meep.author;
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
      nameToIdMapping[meep.author.toLowerCase()] = meep.user_id;
      idToNameMapping[meep.user_id] = meep.author;
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
  
  protonet.on("user.came_online", function(data) {
    var user = dataCache[data.id];
    if (user) {
      user.isOnline = true;
    }
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
    get: function(id, callback) {
      return dataCache[id];
    },

    getName: function(id) {
      return idToNameMapping[id];
    },
    
    getIdByName: function(name) {
      return nameToIdMapping[name.toLowerCase()];
    },
    
    getCurrent: function() {
      return dataCache[viewerId];
    },
    
    getUrl: function(id) {
      return protonet.config.base_url + "/users/" + user.id;
    },
    
    getAdmins: function() {
      return adminIds;
    },
    
    getPreference: function(key) {
      var value       = protonet.storage.get(key),
          preference  = preferences[key];

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
    
    setPreference: function(key, value) {
      protonet.storage.set(key, value);
    },
    
    getPreferences: function() {
      return preferences;
    },
    
    isViewer: function(id) {
      return id == viewerId;
    },
    
    isOnline: function(id) {
      var user = dataCache[id];
      return user ? user.isOnline : false;
    },
    
    getAvatar: function(id) {
      var user = dataCache[id];
      return user ? user.avatar : defaultAvatar;
    }
  };
  
})(protonet);

