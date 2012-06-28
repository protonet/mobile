/**
 * Channel Model
 */
(function() {
  
  var dataCache       = {},
      nameToIdMapping = {},
      idToNameMapping = {},
      uuidToIdMapping = {},
      idToUuidMapping = {},
      subscriptions   = {};
  
  function cache(data) {
    dataCache[data.id] = data;
    nameToIdMapping[data.name.toLowerCase()]   = data.id;
    idToNameMapping[data.id]                   = data.name;
    idToUuidMapping[data.id]                   = data.uuid;
    uuidToIdMapping[data.uuid]                 = data.id;
    
    if (data.rendezvous) {
      var rendezvousArr = data.rendezvous.split(":");
      data.rendezvousPartner = +(rendezvousArr[0] == protonet.config.user_id ? rendezvousArr[1] : rendezvousArr[0]);
    }
    
    protonet.trigger("channel.data_available", data);
  }

  function cacheSubscriptions(data) {
    $.each(data, function(uuid, users) {
      var channelId = uuidToIdMapping[uuid];
      if (protonet.config.show_only_online_users) {
        subscriptions[channelId] = users;
      } else {
        subscriptions[channelId] = $.merge(subscriptions[channelId] || [], users).unique();
      }
    });
  }

  function prepareParameters(options) {
    if (typeof(options) === "function") {
      options = { success: options };
    }
    return $.extend({ includeMeeps: false, bypassCache: false, success: $.noop, error: $.noop }, options);
  }
  
  $.each(protonet.config.channels, function(i, channel) {
    cache(channel);
  });
  
  $.each(protonet.config.users, function(i, user) {
    var userId = user.id;
    $.each(user.subscriptions, function(i, channelId) {
      subscriptions[channelId] = subscriptions[channelId] || [];
      subscriptions[channelId].push(userId);
    });
  });
  
  protonet.on("channel.created channel.updated", function(channel) {
    cache(channel);
  });
  
  protonet.on("user.subscribed_channel", function(data) {
    var channelId = data.channel_id,
        userId    = data.user_id;
    subscriptions[channelId] = subscriptions[channelId] || [];
    if (subscriptions[channelId].indexOf(userId) === -1) {
      subscriptions[channelId].push(userId);
    }
  });
  
  protonet.on("user.unsubscribed_channel", function(data) {
    var channelId    = data.channel_id,
        userId       = data.user_id,
        channelUsers = subscriptions[channelId];
    if (channelUsers) {
      var indexOfUserId = channelUsers.indexOf(userId);
      if (indexOfUserId !== -1) {
        channelUsers.splice(indexOfUserId, 1);
      }
    }
  });
  
  protonet.on("user.came_online", function(user) {
    $.each(user.subscribed_channel_ids, function(i, uuid) {
      var channelId = protonet.data.Channel.getIdByUuid(uuid);
      subscriptions[channelId] = subscriptions[channelId] || [];
      subscriptions[channelId].push(user.id);
    });
  });
  
  protonet.on("channels.update_subscriptions", function(data) {
    cacheSubscriptions(data.data);
  });
  
  protonet.on("users.update_status", function(data) {
    cacheSubscriptions(data.channel_users);
  });
  
  protonet.data.Channel = {
    get: function(id, options) {
      options = prepareParameters(options);
      
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
        if (cached && !options.bypassCache && (!options.includeMeeps || cached.meeps)) {
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
          url:  "/channels/info",
          data: { include_meeps: options.includeMeeps, ids: uncachedIds.join(","), _: 1 },
          success:  function(data) {
            $.each(data, function(i, channel) {
              cache(channel);
            });
            results = results.concat(data);
            options.success(results);
          },
          error:    function(xhr) {
            options.error(xhr);
          }
        });
      }
    },
    
    getCache: function() {
      return dataCache;
    },
    
    getAllSubscribed: function(ids, options) {
      options = prepareParameters(options);
      
      $.ajax({
        dataType: "json",
        url:  "/users/channels",
        data: { channels: ids.join(","), _: 1 },
        success:  function(data) {
          $.each(data, function(i, channel) {
            cache(channel);
          });
          options.success(data);
        },
        error:    function(xhr) {
          options.error(xhr);
        }
      });
    },
    
    getUuid: function(id, callback) {
      return idToUuidMapping[id];
    },

    getName: function(id) {
      return idToNameMapping[id];
    },

    getIdByUuid: function(uuid) {
      return uuidToIdMapping[uuid];
    },
    
    getUrl: function(id) {
      return protonet.config.base_url + "/channels/" + id;
    },
    
    getFolderUrl: function(id) {
      return protonet.data.File.getUrl(this.getFolder(id));
    },

    getIdByName: function(name, callback) {
      return nameToIdMapping[name.toLowerCase()];
    },
    
    getSubscriptions: function(id) {
      return subscriptions[id] || [];
    },
    
    getFolder: function(id) {
      return "/channels/" + id + "/";
    },
    
    isSubscribedByUser: function(channelId, userId) {
      return this.getSubscriptions(channelId).indexOf(userId) !== -1;
    },
    
    isGlobal: function(id) {
      var channel = dataCache[id];
      return channel ? channel.global : false;
    },
    
    isRendezvous: function(id) {
      var channel = dataCache[id];
      return channel ? !!channel.rendezvous : false;
    }
  };
  
})();


