protonet.dispatcher = {
  initialize: function() {
    this._observe();
    this.create();
  },
  
  _observe: function() {
    protonet
      .bind("socket.initialized", function() {
        this.connect();
      }.bind(this))
      
      .bind("socket.connected", function(e, status) {
        this.connectCallback(status);
      }.bind(this))
      
      .bind("socket.send", function(e, data) {
        this.send(data);
      }.bind(this))
      
      .bind("socket.receive", function(e, data) {
        this.receive(data);
      }.bind(this))
      
      .bind("socket.ping_received", function() {
        this.pingCallback();
      }.bind(this))
      
      .bind("socket.reconnect", function() {
        this.reconnect();
      }.bind(this));
      
    $(window)
      .bind("offline unload", this.disconnect.bind(this))
      .bind("online focus", this.connect.bind(this));
  },
  
  create: function() {
    for (var i in this.provider) {
      if (this.provider[i].isSupported()) {
        this.currentProvider = this.provider[i];
        break;
      }
    }
    
    this.currentProvider.initialize();
  },
  
  connect: function() {
    if (this.connected) {
      return;
    }
    this.currentProvider.connect();
  },
  
  connectCallback: function(status) {
    if (status) {
      this.connected = true;
      this.startCheck();
      if (this._reconnect) {
        this._reconnect = false;
        protonet
          .trigger("flash_message.notice", protonet.t("SOCKET_RECONNECTED"))
          .trigger("monster.jump")
          .trigger("socket.reconnected");
      }
    } else {
      this.disconnect();
    }
  },
  
  disconnect: function(event) {
    this.currentProvider.disconnect();
    
    this.stopCheck();
    
    this.startReconnect();
    
    // Don't show a flash message when user closes the window
    var isUnload = (event || {}).type == "unload";
    
    // ... also only shout it to the world when the socket has been online before
    if (this.connected === true && !isUnload) {
      protonet
        .trigger("flash_message.error", protonet.t("SOCKET_DISCONNECTED"))
        .trigger("socket.disconnected");
    }
    
    if (this.connected === undefined && !isUnload) {
      protonet.trigger("flash_message.error", protonet.t("SOCKET_FAILURE"));
    }
    
    this.connected = false;
  },
  
  stopReconnect: function() {
    this._reconnect = false;
    clearTimeout(this.reconnectTimeout);
  },
  
  startReconnect: function() {
    this.stopReconnect();
    this._reconnect = true;
    this.reconnectTimeout = setTimeout(this.connect.bind(this), 5000);
  },
  
  reconnect: function() {
    this.disconnect();
    setTimeout(this.connect(), 1000);
  },
  
  /**
   * Send data to socket every 20 seconds
   * If no answer is received after 5 seconds the socket appears to be offline
   * Try to reconnect after 5 seconds TODO AJ => changed to 10 seconds for dbms change back once the real problem is solved
   */
  startCheck: function() {
    this.stopCheck();
    this.checkInterval = setInterval(this.ping.bind(this), 20000);
  },
  
  stopCheck: function() {
    clearInterval(this.checkInterval);
  },
  
  ping: function() {
    clearTimeout(this.offlineTimeout);
    this.offlineTimeout = setTimeout(this.disconnect.bind(this), 10000);
    
    protonet.trigger("socket.send", { operation: "ping" });
  },
  
  pingCallback: function(message) {
    clearTimeout(this.offlineTimeout);
  },

  receive: function(data) {
    var dataArr = this.currentProvider.receive(data);
    
    if (!dataArr) {
      return;
    }
    
    dataArr = $.makeArray(dataArr);
    $.each(dataArr, function(i, data) {
      if (data.trigger) {
        protonet.trigger(data.trigger, [data]);
      } else if (data.x_target) {
        eval(data.x_target + "(data)");
      }
    });
  },
  
  send: function(data) {
    this.currentProvider.send(data);
  }
};

//= require "provider.js"