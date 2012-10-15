protonet.t = protonet.translate = (function() {
  
  locale = {
    "en": {
      "SOCKET_RECONNECTED": "You are online again.",
      "SOCKET_DISCONNECTED": "Connection lost. Reconnect in progress.",
      "SOCKET_FAILURE": "Something went wrong."
    }
  }
  
  return function(key) {

    return locale["en"][key] || key
    
  };
})();
