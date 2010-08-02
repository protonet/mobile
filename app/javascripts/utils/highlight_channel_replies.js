//= require "template.js"

protonet.utils.highlightChannelReplies = (function() {
  var REG_EXP         = /(\s|^)@([\w\.\-_@]+)/g,
      channelMapping  = {};
  
  protonet.Notifications.bind("channels.data_available", function(e, channelData, availableChannels) {
    $.each(availableChannels, function(channelName, channelId) {
      channelMapping[channelName.toLowerCase()] = channelId;
    });
  });
  
  return function(str) {
    return str.replace(REG_EXP, function(original, $1, $2) {
      var channelId = channelMapping[$2.toLowerCase()];
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