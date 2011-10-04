/**
 * Returns the channel name for the given id
 */
protonet.utils.getChannelName = (function() {
  var channels = protonet.config.available_channels || {}; // format: { "channel_name": channel_id, ... }
  return function(id) {
    var channelName;
    id = +id;
    for (channelName in channels) {
      if (channels[channelName] === id) {
        return channelName;
      }
    }
    return "";
  };
})();