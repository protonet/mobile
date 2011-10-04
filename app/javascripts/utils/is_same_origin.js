protonet.utils.isSameOrigin = (function() {
  var anchor    = document.createElement("a"),
      location  = window.location;
  return function(url) {
    anchor.href = url;
    return  anchor.protocol === location.protocol &&
            anchor.host     === location.host;
  };
})();