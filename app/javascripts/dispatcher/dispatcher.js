protonet.dispatcher = {
  initialize: function() {
    this._observe();
    this.create();
  },
  
  initializeCallback: function() {
    this.initialized = true;
    this.connect();
  },
  
  _observe: function() {
    protonet
      .on("socket.initialized", function() {
        this.initializeCallback();
      }.bind(this))
      
      .on("socket.connected", function(status) {
        this.connectCallback(status);
      }.bind(this))
      
      .on("socket.send", function(data) {
        this.send(data);
      }.bind(this))
      
      .on("socket.receive", function(data) {
        this.receive(data);
      }.bind(this))
      
      .on("socket.ping_received", function() {
        this.pingCallback();
      }.bind(this))
      
      .on("socket.reconnect", function() {
        this.reconnect();
      }.bind(this));
      
    $(window)
      .bind("offline unload", this.disconnect.bind(this))
      .bind("online focus", this.connect.bind(this));
  },
  
  create: function() {
    var queryParams = location.search, i;
    if (queryParams.indexOf("noflash=1") !== -1) {
      delete this.provider.FlashSocket;
    }
    
    if (protonet.config.force_xhr_streaming || queryParams.indexOf("forcexhr=1") !== -1) {
      this.provider = { HttpStreaming: this.provider.HttpStreaming };
    }
    
    for (i in this.provider) {
      if (this.provider[i].isSupported()) {
        this.currentProvider = this.provider[i];
        break;
      }
    }
    
    this.currentProvider && this.currentProvider.initialize();
  },
  
  connect: function() {
    if (this.connected || this.connecting || !this.initialized) {
      return;
    }
    
    this.connecting = true;
    this.currentProvider.connect();
  },
  
  connectCallback: function(status) {
    this.connecting = false;
    
    if (status) {
      this.connected = true;
      this.startCheck();
      if (this._reconnect) {
        this._reconnect = false;
        protonet
          .trigger("flash_message.notice", protonet.t("SOCKET_RECONNECTED"))
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
    this.reconnectTimeout = setTimeout(this.connect.bind(this), (5).seconds());
  },
  
  reconnect: function() {
    this.disconnect();
    setTimeout(this.connect.bind(this), (1).second());
  },
  
  /**
   * Send data to socket every 20 seconds
   * If no answer is received after 5 seconds the socket appears to be offline
   * Try to reconnect after 5 seconds
   */
  startCheck: function() {
    this.stopCheck();
    this.checkInterval = setInterval(this.ping.bind(this), (20).seconds());
  },
  
  stopCheck: function() {
    clearInterval(this.checkInterval);
  },
  
  ping: function() {
    clearTimeout(this.offlineTimeout);
    this.offlineTimeout = setTimeout(this.disconnect.bind(this), (5).seconds());
    
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
        protonet.trigger(data.trigger, data);
      } else if (data.x_target) {
        eval(data.x_target + "(data)");
      } else if (data.eval) {
        eval(data.eval);
      }
    });
  },
  
  send: function(data) {
    this.currentProvider.send(data);
  }
};

//= require "provider.js"