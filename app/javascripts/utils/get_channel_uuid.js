protonet.utils.getChannelUuid = (function() {
  var mapping = protonet.config.channel_id_to_uuid_mapping || {};
  protonet.bind("channel.added", function(e, channel) {
    mapping[channel.id] = channel.uuid;
  });
  
  return function(channelId) {
    return channels[channelId];
  };
})();