protonet.dispatcher = {
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
        this.connectSocket();
      }.bind(this))
      
      .bind("socket.connected", function(e, status) {
        this.connectSocketCallback(status);
      }.bind(this))
    
      .bind("socket.send", function(e, data) {
        this.sendData(data);
      }.bind(this))
    
      .bind("socket.receive", function(e, data) {
        this.receiveData(data);
      }.bind(this))
    
      .bind("socket.ping_received", function() {
        this.pingSocketCallback();
      }.bind(this))
      
      .bind("socket.reconnect", function() {
        this.reconnectSocket();
      }.bind(this));
      
    $(window)
      .bind("offline unload", this.disconnectSocket.bind(this))
      .bind("online focus", this.connectSocket.bind(this));
  },
  
  createSocket: function() {
    // We have to insert the flash outside the body in firefox, otherwise the flash gets reloaded as soon as you
    // change the css overflow property of the body element
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=90268
    var container   = $("<div />", { id: "socket-container" }).appendTo($.browser.mozilla ? "html" : "body"),
        attributes  = { id: this.SOCKET_ID },
        params      = { allowscriptaccess: "sameDomain", wmode: "opaque" };
    
    // Fires "socket.initialized" when ready
    swfobject.embedSWF(
      "/flash/socket.swf?" + new Date().getTime(),
      "socket-container",
      "auto", "auto", "8",
      null, {}, params, attributes
    );
  },
  
  connectSocket: function() {
    if (this.connected) {
      return;
    }
    
    this.socket = this.socket || swfobject.getObjectById(this.SOCKET_ID);
    this.socket.connectSocket(this.server, this.serverPort);
  },
  
  connectSocketCallback: function(status) {
    if (status) {
      this.connected = true;
      this.authenticateUser();
      this.startSocketCheck();
      if (this.reconnect) {
        this.reconnect = false;
        protonet.Notifications
          .trigger("flash_message.notice", protonet.t("SOCKET_RECONNECTED"))
          .trigger("monster.jump")
          .trigger("socket.reconnected");
      }
    } else {
      this.disconnectSocket();
    }
  },
  
  disconnectSocket: function(event) {
    this.socket.closeSocket();
    this.stopSocketCheck();
    
    this.startSocketReconnect();
    
    // Don't show a flash message when user closes the window
    var isUnload = event && event.type == "unload";
    
    // ... also only shout it to the world when the socket has been online before
    if (this.connected && !isUnload) {
      protonet.Notifications
        .trigger("flash_message.error", protonet.t("SOCKET_DISCONNECTED"))
        .trigger("socket.disconnected");
    }
    
    this.connected = false;
  },
  
  stopSocketReconnect: function() {
    this.reconnect = false;
    clearTimeout(this.reconnectTimeout);
  },
  
  startSocketReconnect: function() {
    this.stopSocketReconnect();
    this.reconnect = true;
    this.reconnectTimeout = setTimeout(this.connectSocket.bind(this), 5000);
  },
  
  reconnectSocket: function() {
    this.disconnectSocket();
    setTimeout(this.connectSocket(), 1000);
  },
  
  /**
   * Send data to socket every 20 seconds
   * If no answer is received after 5 seconds the socket appears to be offline
   * Try to reconnect after 5 seconds
   */
  startSocketCheck: function() {
    this.stopSocketCheck();
    this.socketCheckInterval = setInterval(this.pingSocket.bind(this), 20000);
  },
  
  stopSocketCheck: function() {
    clearInterval(this.socketCheckInterval);
  },
  
  pingSocket: function() {
    clearTimeout(this.socketOfflineTimeout);
    this.socketOfflineTimeout = setTimeout(this.disconnectSocket.bind(this), 5000);
    
    protonet.Notifications.trigger("socket.send", { operation: "ping" });
  },
  
  pingSocketCallback: function(message) {
    clearTimeout(this.socketOfflineTimeout);
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