protonet.utils.stripTags = (function() {
  var DUMMY = $("<span />");
  return function(str) {
    return DUMMY.html(str).text();
  };
})();