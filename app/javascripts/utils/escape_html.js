protonet.utils.escapeHtml = (function() {
  var MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };
  
  var REG_EXP = /[&<>]/g;
  
  return function(str) {
    return str.replace(REG_EXP, function(c) { return MAP[c]; });
  };
})();