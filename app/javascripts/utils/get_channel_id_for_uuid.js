protonet.utils.getChannelIdForUuid = (function() {
  var mapping = protonet.config.channel_uuid_to_id_mapping || {};
  
  protonet.bind("channel.added channel.initialized", function(e, channel) {
    mapping[channel.uuid] = channel.id;
  });
  
  return function(channelUuid) {
    return mapping[channelUuid];
  };
})();