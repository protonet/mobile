protonet.utils.highlightReplies = (function() {
  var REG_EXP = /(\s|^)@([\w\.\-_@]+)/g;
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      if (protonet.globals.channelSelector.channelsDowncaseMapping[$2] || ($.inArray( $2, protonet.globals.channelSelector.channels) != -1)) {
        return $1 + "@" + '<a class="reply channel">' + $2 + '</a>';
      } else if ($2.toLowerCase().match(protonet.config.user_name.toLowerCase())) {
        return $1 + "@" + '<span class="reply to-me">' + $2 + '</span>';
      } else {
        return $1 + "@" + '<span class="reply ' + $2 + '">' + $2 + '</span>';
      }
    });
  };
})();

