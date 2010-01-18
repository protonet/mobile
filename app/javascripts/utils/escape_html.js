protonet.utils.escapeHtml = (function() {
  var MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };
  return function(str) {
    return str.replace(/[&<>]/g, function(c) { return MAP[c]; });
  };
})();