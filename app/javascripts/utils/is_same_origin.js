protonet.utils.isSameOrigin = (function() {
  var anchor        = document.createElement("a"),
      location      = window.location,
      PORT_REG_EXP  = /\:\d+$/;
  
  function getPort(obj) {
    return Number(obj.port) || (obj.protocol === "https:" ? 443 : 80);
  }
  
  return function(url) {
    anchor.href = url;
    var anchorHost    = anchor.host.replace(PORT_REG_EXP, ""),
        locationHost  = location.host.replace(PORT_REG_EXP, "");
    
    return anchor.protocol      === location.protocol &&
           anchorHost           === locationHost      &&
           getPort(anchor)      === getPort(location);
  };
})();