//= require "template.js"

/**
 * Highlights channel replies in a string
 *
 * @example
 *    protonet.utils.highlightChannelReplies("check out @hot-chicks")
 *      => "check out @<a href='#channel-link'>hot-chicks</a>"
 *    protonet.utils.highlightChannelReplies.result
 *      => [2] // array of channel ids
 */
protonet.utils.highlightChannelReplies = (function() {
  var REG_EXP         = /(\s|^)@([\w\.\-_@]+)/g,
      channelMapping  = {};
  
  protonet.Notifications.bind("channels.data_available", function(e, channelData, availableChannels) {
    $.each(availableChannels, function(channelName, channelId) {
      channelMapping[channelName.toLowerCase()] = channelId;
    });
  });
  
  return function(str) {
    var result = arguments.callee.result = [];
    return str.replace(REG_EXP, function(original, $1, $2) {
      var channelId = channelMapping[$2.toLowerCase()];
      if (!channelId) {
        return original;
      }
      
      result.push(channelId);
      return $1 + new protonet.utils.Template("channel-reply-template", {
        channel_id:   channelId,
        channel_name: $2
      });
    });
  };
})();