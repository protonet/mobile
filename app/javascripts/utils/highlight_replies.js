protonet.utils.highlightReplies = (function() {
  var REG_EXP = /(\s|^)@([^@\s$"')]+)/g,
      TEMPLATE = '<span class="reply">{reply}</span>';
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      if(jQuery.inArray( $2, protonet.globals.channelSelector.channels ) != -1) {
        return $1 + "@" + '<span class="reply channel">' + $2 + '</span>';
      } else {
        return $1 + "@" + '<span class="reply ' + $2 + '">' + $2 + '</span>';
      }
    });
  };
})();

