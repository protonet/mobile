protonet.dispatcher = {
  timeouts: {
    SOCKET_CHECK:     30000,
    SOCKET_OFFLINE:   40000,
    SOCKET_RECONNECT: 5000
  },
  
  initialize: function() {
    this.server           = protonet.config.dispatching_server;
    this.server_port      = protonet.config.dispatching_server_port;
    this.user_auth_token  = protonet.config.token;
    this.user_id          = protonet.config.user_id;
    this.socketId         = "flash-socket";

    this._observe();
    this.createSocket();
  },
  
  _observe: function() {
    protonet.Notifications.bind("socket.initialized", function(e) {
      this.socketReadyCallback();
    }.bind(this));
    
    protonet.Notifications.bind("socket.connected", function(e, status) {
      this.socketConnectCallback(status);
    }.bind(this));
    
    protonet.Notifications.bind("socket.send", function(e, data) {
      this.sendMessage(data);
    }.bind(this));
    
    protonet.Notifications.bind("socket.receive", function(e, data) {
      this.messageReceived(data);
    }.bind(this));
    
    protonet.Notifications.bind("socket.check", function() {
      this.socketCheck();
    }.bind(this));
  },
  
  createSocket: function() {
    var container   = $("<div />", { id: "socket-container" }).appendTo("body"),
        attributes  = { id: this.socketId },
        params      = { allowscriptaccess: "sameDomain" };
    
    swfobject.embedSWF(
      "/flash/socket.swf?" + new Date().getTime(),
      "socket-container",
      "auto", "auto", "8",
      null, {}, params, attributes
    );
  },
  
  socketReadyCallback: function() {
    this.socket = swfobject.getObjectById(this.socketId);
    this.connectSocket();
    $(window).bind({
      unload: function() {
        this.socket.closeSocket();
      }.bind(this),
      focus: function() {
        this.reconnectSocketIfNotConnected();
      }.bind(this)
    });
  },
    
  connectSocket: function() {
    this.socket.connectSocket(this.server, this.server_port);
  },
  
  socketConnectCallback: function(status) {
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
  
  reconnectSocketIfNotConnected: function() {
    if ((new Date() - this.socket_active) > this.timeouts.SOCKET_OFFLINE && !this.socket_reconnecting) {
      console.log("socket offline");
      this.socket_reconnecting = true;
      setTimeout(function() {
        this.socket_reconnecting = false;
      }.bind(this), this.timeouts.SOCKET_OFFLINE);
      this.socket.closeSocket();
      // protonet.globals.endlessScroller.loadNotReceivedTweets();
      this.connectSocket();
    }
  },
  
  socketCheck: function() {
    this.reconnectSocketIfNotConnected();
    this.pingSocket();
  },
  
  pingSocket: function() {
    protonet.Notifications.trigger("socket.send", JSON.stringify({ operation: "ping" }));
  },
  
  pingSocketCallback: function(message) {
    this.socket_active = new Date();
  },

  authenticateUser: function() {
    protonet.Notifications.trigger("socket.send", JSON.stringify({
      operation: "authenticate",
      payload: {
        user_id:  this.user_id,
        token:    this.user_auth_token,
        type:     "web"
      }
    }));
  },

  messageReceived: function(data) {
    // console.log(raw_data + " received.");
    // FIXME: Handle this in the flash socket
    if ($.trim(raw_data).startsWith("<?xml")) {
      return;
    }
    
    var message = JSON.parse(data);
    
    switch(message.x_target) {
      // special case: on initial successful connection this sets the socket_id
      // to the message form
      case "socket_id":
        protonet.Notifications.trigger("socket.update_id", message.socket_id);
        break;
      default:
        eval(message.x_target + '(message)');
    }
  },

  sendMessage: function(data, delimit) {
    if (delimit) {
      data = data + "\0";
    }
    this.socket.sendData(data);
  }
};