/**
 * Returns the channel id for the given name
 */
protonet.utils.getChannelId = (function() {
  var channelNameToIdMapping = protonet.config.channel_name_to_id_mapping || {},
      channelLowerCaseNameToIdMapping = {},
      channelName;
  
  for (channelName in channelNameToIdMapping) {
    channelLowerCaseNameToIdMapping[channelName.toLowerCase()] = channelNameToIdMapping[channelName];
  }
  
  protonet.bind("channel.added", function(e, channel) {
    channelLowerCaseNameToIdMapping[channel.name.toLowerCase()] = channel.id;
  });
  
  return function(name) {
    return channelLowerCaseNameToIdMapping[name.toLowerCase()];
  };
})();