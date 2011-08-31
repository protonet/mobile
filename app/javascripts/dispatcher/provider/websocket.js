protonet.dispatcher.provider.WebSocket = {
  isSupported: function() {
    return !protonet.config.force_xhr_streaming && location.search.indexOf("noflash=1") == -1 && protonet.user.Browser.SUPPORTS_HTML5_WEBSOCKET();
  },
  
  initialize: function() {
    protonet.trigger("socket.initialized");
  },

  connect: function() {
    this.socket = new WebSocket("ws://" + protonet.config.dispatching_server + ":" + protonet.config.dispatching_websocket_port + "/");
    
    this.socket.onmessage = function(event) { 
      protonet.trigger("socket.receive", event.data);
    };
    
    this.socket.onopen = function() {
      this.send({
        operation: "authenticate",
        payload: {
          user_id:  protonet.config.user_id,
          token:    protonet.config.token,
          type:     "web"
        }
      });
      protonet.trigger("socket.connected", true);
    }.bind(this);
    
    this.socket.onclose = function() { 
      protonet.trigger("socket.connected", false);
    };
    
    this.socket.onerror = function() {
      protonet.trigger("socket.connected", false);
    };
  },
  
  disconnect: function() {
    if (!this.socket) {
      return;
    }
    this.socket.close();
  },
  
  send: function(data) {
    if (!this.socket || !this.socket.send) {
      return;
    }
    try { this.socket.send(JSON.stringify(data)); } catch(e) {}
  },
  
  receive: function(rawData) {
    return JSON.parse(rawData);
  }
};