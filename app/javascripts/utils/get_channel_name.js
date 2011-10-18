/**
 * Returns the channel name for the given id
 */
protonet.utils.getChannelName = (function() {
  var channelNameToIdMapping = protonet.config.channel_name_to_id_mapping || {},
      channelIdToNameMapping = {},
      channelName;
  for (channelName in channelNameToIdMapping) {
    channelIdToNameMapping[channelNameToIdMapping[channelName]] = channelName;
  }
  
  protonet.bind("channel.added", function(e, channel) {
    channelIdToNameMapping[channel.id] = channel.name;
  });
  
  return function(id) {
    return channelIdToNameMapping[id];
  };
})();