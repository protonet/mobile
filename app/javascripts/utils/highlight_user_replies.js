/**
 * Highlights user replies in a string
 *
 * TODO: One day this needs to be merged with highlight_channel_replies.js
 *
 * @example
 *    protonet.utils.highlightUserReplies("@dudemeister what's up!")
 *      => "check out @<a href='#user-link'>dudemeister</a>"
 *    protonet.utils.highlightChannelReplies.result
 *      => [2] // array of user ids
 */
protonet.utils.highlightUserReplies = (function() {
  var REG_EXP         = /(\s|^|\()@([\w\.\-_@]+)/g,
      TRAILING_CHARS  = /[\.\-_]+$/;
  
  return function(str) {
    var result = arguments.callee.result = [];
    return str.replace(REG_EXP, function(original, $1, $2) {
      var trailingChars = ($2.match(TRAILING_CHARS) || [""])[0],
          userName      = trailingChars ? $2.replace(TRAILING_CHARS, "") : $2,
          userId        = protonet.data.User.getId(userName),
          isViewer      = protonet.data.User.isViewer(userId);
      
      if (!userId) {
        return original;
      }
      
      result.push(userId + "");
      return $1 + new protonet.utils.Template("user-reply-template", {
        user_id:    userId,
        user_name:  userName,
        class_name: isViewer ? "myself" : ""
      }) + trailingChars;
    });
  };
})();
