protonet.utils.highlightReplies = (function() {
  var REG_EXP = /(\s|^)@([^@\s$"')]+)/g,
      TEMPLATE = '<span class="reply">{reply}</span>';
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      // protonet.globals.userWidget.
      return $1 + "@" + '<span class="reply ' + $2 + '">' + $2 + '</span>';
    });
  };
})();