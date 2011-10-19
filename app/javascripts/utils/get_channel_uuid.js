protonet.utils.getChannelUuid = (function() {
  var channelUuidToIdMapping = protonet.config.channel_uuid_to_id_mapping || {},
      channelIdToUuidMapping = {},
      channelUuid;
  
  for (channelUuid in channelUuidToIdMapping) {
    channelIdToUuidMapping[channelUuidToIdMapping[channelUuid]] = channelUuid;
  }
  
  protonet.bind("channel.added channel.initialized", function(e, channel) {
    channelIdToUuidMapping[channel.id] = channel.uuid;
  });
  
  return function(channelId) {
    return channelIdToUuidMapping[channelId];
  };
})();