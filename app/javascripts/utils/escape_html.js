protonet.utils.escapeHtml = (function() {
  var MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&#34;',
    "'": '&#39;'
  };
  return function(str) {
    return str.replace(/[&<>'"]/g, function(c) { return MAP[c]; });
  };
})();