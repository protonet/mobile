protonet.dispatcher = {
  timeouts: {
    SOCKET_CHECK:     30000,
    SOCKET_OFFLINE:   40000,
    SOCKET_RECONNECT: 5000
  },
  
  SOCKET_ID: "flash-socket",
  
  initialize: function() {
    this.server           = protonet.config.dispatching_server;
    this.serverPort       = protonet.config.dispatching_server_port;
    this.userAuthToken    = protonet.config.token;
    this.userId           = protonet.config.user_id;
    
    this._observe();
    this.createSocket();
  },
  
  _observe: function() {
    protonet.Notifications
      .bind("socket.initialized", function() {
        this.createSocketCallback();
      }.bind(this))
    
      .bind("socket.connected", function(e, status) {
        this.connectSocketCallback(status);
      }.bind(this))
    
      .bind("socket.disconnected", function() {
        this.reconnectSocket();
      }.bind(this))
    
      .bind("socket.send", function(e, data) {
        this.sendData(data);
      }.bind(this))
    
      .bind("socket.receive", function(e, data) {
        this.receiveData(data);
      }.bind(this))
    
      .bind("socket.check", function() {
        this.socketCheck();
      }.bind(this))
    
      .bind("socket.ping_received", function() {
        this.pingSocketCallback();
      }.bind(this));
  },
  
  createSocket: function() {
    var container   = $("<div />", { id: "socket-container" }).appendTo("body"),
        attributes  = { id: this.SOCKET_ID },
        params      = { allowscriptaccess: "sameDomain", wmode: "transparent" };
    
    swfobject.embedSWF(
      "/flash/socket.swf?" + new Date().getTime(),
      "socket-container",
      "auto", "auto", "8",
      null, {}, params, attributes
    );
  },
  
  createSocketCallback: function() {
    this.socket = swfobject.getObjectById(this.SOCKET_ID);
    this.connectSocket();
    $(window).bind({
      unload: function() { this.socket.closeSocket(); }.bind(this),
      focus: function() { this.reconnectSocketIfNotConnected(); }.bind(this)
    });
  },
    
  connectSocket: function() {
    this.socket.connectSocket(this.server, this.serverPort);
  },
  
  connectSocketCallback: function(status) {
    if (status) {
      this.startSocketCheck();
      this.authenticateUser();
    } else {
      setTimeout(this.reconnectSocketIfNotConnected.bind(this), this.timeouts.SOCKET_RECONNECT);
    }
  },
  
  startSocketCheck: function() {
    if (this.socketCheckInterval) {
      return;
    }
    
    this.socketCheckInterval = setInterval(function() {
      protonet.Notifications.trigger("socket.check");
    }, this.timeouts.SOCKET_CHECK);
  },
  
  socketCheck: function() {
    this.reconnectSocketIfNotConnected();
    this.pingSocket();
  },
  
  reconnectSocketIfNotConnected: function() {
    if ((new Date() - this.socketActive) > this.timeouts.SOCKET_OFFLINE && !this.socketReconnecting) {
      protonet.Notifications.trigger("socket.disconnected");
    }
  },
  
  reconnectSocket: function() {
    this.socketReconnecting = true;
    setTimeout(function() {
      this.socketReconnecting = false;
    }.bind(this), this.timeouts.SOCKET_OFFLINE);
    this.socket.closeSocket();
    // protonet.globals.endlessScroller.loadNotReceivedTweets();
    this.connectSocket();
  },
  
  pingSocket: function() {
    protonet.Notifications.trigger("socket.send", { operation: "ping" });
  },
  
  pingSocketCallback: function(message) {
    this.socketActive = new Date();
  },

  authenticateUser: function() {
    protonet.Notifications.trigger("socket.send", {
      operation: "authenticate",
      payload: {
        user_id:  this.userId,
        token:    this.userAuthToken,
        type:     "web"
      }
    });
  },

  receiveData: function(rawData) {
    /**
     * Policy XML message
     * FIXME: Handle this in the flash socket
     */
    if ($.trim(rawData).startsWith("<?xml")) {
      return;
    }
    
    var data = JSON.parse(rawData);
    if (data.trigger) {
      protonet.Notifications.trigger(data.trigger, [data]);
    } else if (data.x_target) {
      eval(data.x_target + "(data)");
    }
  },

  sendData: function(data) {
    this.socket.sendData(JSON.stringify(data));
  }
};