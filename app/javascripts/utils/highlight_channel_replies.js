//= require "template.js"

protonet.utils.highlightChannelReplies = (function() {
  var REG_EXP         = /(\s|^)@([\w\.\-_@]+)/g,
      channelMapping  = {};
  
  protonet.Notifications.bind("channels.data_available", function(e, channels) {
    $.each(channels, function(i, channel) {
      channelMapping[channel.name.toLowerCase()] = channel.id;
    });
  });
  
  return function(str) {
    return str.replace(REG_EXP, function(original, $1, $2) {
      var channelId = channelMapping[$2];
      if (!channelId) {
        return original;
      }
      return $1 + new protonet.utils.Template("channel-reply-template", {
        channel_id:   channelId,
        channel_name: $2
      });
    });
  };
})();