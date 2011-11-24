protonet.utils.isSameOrigin = (function() {
  var anchor        = document.createElement("a"),
      location      = window.location,
      PORT_REG_EXP  = /\:\d+$/;
  return function(url) {
    anchor.href = url;
    var anchorHost    = anchor.host.replace(PORT_REG_EXP, ""),
        locationHost  = location.host.replace(PORT_REG_EXP, "");
    return  anchor.protocol === location.protocol &&
            anchorHost      === locationHost;
  };
})();