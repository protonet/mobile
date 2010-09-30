//= require "template.js"

/**
 * Highlights user replies in a string
 *
 * @example
 *    protonet.utils.highlightUserReplies("@dudemeister what's up!")
 *      => "check out @<a href='#user-link'>dudemeister</a>"
 *    protonet.utils.highlightChannelReplies.result
 *      => [2] // array of user ids
 */
protonet.utils.highlightUserReplies = (function() {
  var REG_EXP         = /(\s|^)@([\w\.\-_@]+)/g,
      userMapping     = {},
      viewer          = {};
  
  protonet.Notifications.bind("user.added", function(e, data) {
    userMapping[data.name.toLowerCase()] = Number(data.id);
  });
  
  protonet.Notifications.bind("user.data_available", function(e, userData) {
    viewer = userData;
  });
  
  protonet.Notifications.bind("users.data_available", function(e, userData) {
    $.each(userData, function(userId, data) {
      userMapping[data.name.toLowerCase()] = Number(userId);
    });
  });
  
  return function(str) {
    var result = arguments.callee.result = [];
    return str.replace(REG_EXP, function(original, $1, $2) {
      var userId = userMapping[$2.toLowerCase()],
          isViewer = viewer.id == userId;
      if (!userId) {
        return original;
      }
      
      result.push(userId);
      return $1 + new protonet.utils.Template("user-reply-template", {
        user_id:    userId,
        user_name:  $2,
        class_name: isViewer ? "myself" : ""
      });
    });
  };
})();