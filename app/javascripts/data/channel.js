(function() {
  
  var dataCache       = {},
      nameToIdMapping = {},
      idToNameMapping = {},
      uuidToIdMapping = protonet.config.channel_uuid_to_id_mapping,
      idToUuidMapping = {},
      subscriptions   = {};
  
  $.each(protonet.config.channel_uuid_to_id_mapping, function(uuid, id) {
    idToUuidMapping[id] = uuid;
  });
  
  $.each(protonet.config.channel_name_to_id_mapping, function(name, id) {
    nameToIdMapping[name.toLowerCase()] = id;
    idToNameMapping[id] = name;
  });
  
  $.each(protonet.config.users, function(i, user) {
    var userId = user.id;
    $.each(user.subscriptions, function(i, channelId) {
      subscriptions[channelId] = subscriptions[channelId] || [];
      subscriptions[channelId].push(userId);
    });
  });
  
  function cache(data) {
    dataCache[data.id] = data;
    nameToIdMapping[data.name.toLowerCase()]   = data.id;
    idToNameMapping[data.id]                   = data.name;
    idToUuidMapping[data.id]                   = data.uuid;
    uuidToIdMapping[data.uuid]                 = data.id;
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
  
  protonet.on("channel.added", function(channel) {
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
      options = $.extend({ includeMeeps: false, bypassCache: false, success: $.noop, error: $.noop }, options);
      
      var cached = dataCache[id];
      if (cached && !options.bypassCache && (!options.includeMeeps || cached.meeps)) {
        options.success(dataCache[id]);
      } else {
        $.ajax({
          dataType: "json",
          url:      "/channels/" + id,
          data:     { include_meeps: options.includeMeeps, ajax: 1 },
          success:  function(data) {
            cache(data);
            options.success(data);
          },
          error:    function(xhr) {
            options.error(xhr);
          }
        });
      }
    },
    
    getAllByIds: function(ids, options) {
      options = $.extend({ includeMeeps: false, success: $.noop, error: $.noop }, options);
      
      $.ajax({
        dataType: "json",
        url:  "/channels/list",
        data: { include_meeps: options.includeMeeps, ajax: 1, channels: ids.join(",") },
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

    getIdByName: function(name, callback) {
      return nameToIdMapping[name.toLowerCase()];
    },
    
    getSubscriptions: function(id) {
      return subscriptions[id];
    },
    
    isGlobal: function(id) {
      var channel = dataCache[id];
      return channel ? channel.global : false;
    }
  };
  
})();


