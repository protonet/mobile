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
  var REG_EXP         = /(\s|^|\()@([\w\.\-_@]+)/g,
      TRAILING_CHARS  = /[\.\-_]+$/,
      channelMapping  = {};
  
  $.each(protonet.config.available_channels, function(channelName, channelId) {
    channelMapping[channelName.toLowerCase()] = channelId;
  });
  
  protonet.bind("channel.added", function(e, channel) {
    channelMapping[channel.name.toLowerCase()] = channel.id;
  });
  
  return function(str) {
    var result = arguments.callee.result = [];
    return str.replace(REG_EXP, function(original, $1, $2) {
      var trailingChars = ($2.match(TRAILING_CHARS) || [""])[0],
          channelName   = trailingChars ? $2.replace(TRAILING_CHARS, "") : $2,
          channelId     = channelMapping[channelName.toLowerCase()];
      
      if (!channelId) {
        return original;
      }
      
      result.push(channelId);
      return $1 + new protonet.utils.Template("channel-reply-template", {
        channel_id:   channelId,
        channel_name: channelName
      }) + trailingChars;
    });
  };
})();