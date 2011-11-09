protonet.dispatcher.provider.WebSocket = {
  isSupported: function() {
    // We are not supporting https yet (dudemeister, said that he has an idea but he was not willing to share it with me)
    return protonet.user.Browser.SUPPORTS_HTML5_WEBSOCKET() && location.protocol === "http:";
  },
  
  initialize: function() {
    protonet.trigger("socket.initialized");
  },

  connect: function() {
    if (location.protocol == 'https:') {
      this.socket = new WebSocket("wss://" + protonet.config.dispatching_server + ":" + protonet.config.dispatching_websocket_ssl_port + "/");
    } else {
      this.socket = new WebSocket("ws://" + protonet.config.dispatching_server + ":" + protonet.config.dispatching_websocket_port + "/");
    }
    
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
    
    $(window)
      .bind("beforeunload.websockets", function() {
        this.socket.onclose = $.noop;
      }.bind(this))
      
      .bind("keydown.websockets", function(event) {
        // Firefox closes a websocket connection when you press ESC!
        // That's not cool, so we have to avoid this by canceling the default behavior
        // onkeydown 27 (ESC key)
        // Well apart from that I'm currently very thirsty but we do have no
        // Alcohol-free Krombacher Radler anymore and Ali is not willing to go out and buy more
        // even though he just successfully mastered Ramadan 2011.
        // Whatever, I'm gonna focus on working now despite the fact that I'm very desperate for a cold drink.
        // Someday people will thank me for that and I'm gonna earn so much money that I can afford buying a Helicopter.
        // Then I could borrow Ali it so he can fly to the next grocery store to get the drinks. That would be truly awesome.
        if (event.keyCode === 27) {
          event.preventDefault();
        }
      });
  },
  
  disconnect: function() {
    if (!this.socket) {
      return;
    }
    $(window).unbind(".websockets");
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