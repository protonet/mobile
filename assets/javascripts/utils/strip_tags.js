protonet.utils.stripTags = (function() {
  var regExp = /<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi;
  return function(str) {
    return str.replace(regExp, "");
  };
})();