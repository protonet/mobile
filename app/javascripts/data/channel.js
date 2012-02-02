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
  
  function cacheSubscriptions(data) {
    $.each(data, function(uuid, users) {
      var channelId = uuidToIdMapping[uuid];
      if (protonet.config.show_only_online_users) {
        subscriptions[channelId] = users;
      } else {
        subscriptions[channelId] = $.merge(subscriptions[channelId] || [], subscriptions).unique();
      }
    });
  }
  
  protonet.on("channel.added channel.initialized", function(channel) {
    dataCache[channel.id]                         = channel;
    nameToIdMapping[channel.name.toLowerCase()]   = channel.id;
    idToNameMapping[channel.id]                   = channel.name;
    idToUuidMapping[channel.id]                   = channel.uuid;
    uuidToIdMapping[channel.uuid]                 = channel.id;
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
    get: function(id, callback, options) {
      options = $.extend({}, { bypassCache: false, includeMeeps: false }, options);
      
      if (dataCache[id] && !options.bypassCache) {
        callback(dataCache[id]);
      } else {
        $.ajax({
          dataType: "json",
          url:      "/channels/" + id,
          data:     { include_meeps: options.includeMeeps },
          success:  function(data) {
            dataCache[id] = data;
            callback(data);
          },
          error:    function() {
            protonet.trigger("flash_message.error", protonet.t("LOADING_CHANNEL_ERROR"));
          }
        });
      }
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


