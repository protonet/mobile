protonet.dispatching.DispatchingSystem = function() {
  this.server = protonet.config.dispatching_server;
  this.user_auth_token = protonet.config.token;
  this.user_id = protonet.config.user_id;
  this.socketId = "flash_socket";
  this.createSocket();
};
   
protonet.dispatching.DispatchingSystem.prototype = {
  "VERSION": 1, // Increase this number manually if you want to invalidate browser cache
  "timeouts": {
    SOCKET_CHECK: 30000,
    SOCKET_OFFLINE: 40000,
    SOCKET_RECONNECT: 5000
  },
  
  
  "createSocket": function() {
    var container = $("<div />", { id: "socket-container" }).appendTo("body"),
        attributes = { id: this.socketId },
        params = { allowscriptaccess: "sameDomain" };
    
    swfobject.embedSWF(
      "/flash/socket.swf?v=" + this.VERSION,
      "socket-container",
      "auto", "auto", "8",
      null, {}, params, attributes
    );
  },
  
  "socketReadyCallback": function() {
    console.log('socket ready, trying to establish connection');
    
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
    
  "connectSocket": function() {
    this.socket.connectSocket(this.server);
  },
  
  "socketConnectCallback": function(status) {
    console.log('connection established? ' + status);
    
    if (status) {
      this.startSocketCheck();
      this.authenticateUser();
    } else {
      setTimeout(this.reconnectSocketIfNotConnected.bind(this), this.timeouts.SOCKET_RECONNECT);
    }
  },
  
  "startSocketCheck": function() {
    if(!this.socket_check_interval) {
      this.socket_check_interval = setInterval(this.socketCheck.bind(this), this.timeouts.SOCKET_CHECK);
    }
  },
  
  "reconnectSocketIfNotConnected": function() {
    if((new Date() - this.socket_active) > this.timeouts.SOCKET_OFFLINE && !this.socket_reconnecting) {
      this.socket_reconnecting = true;
      setTimeout(function(){ this.socket_reconnecting = false; }.bind(this), this.timeouts.SOCKET_OFFLINE);
      console.log('socket offline');
      this.socket.closeSocket();
      protonet.globals.endlessScroller.loadNotReceivedTweets();
      this.connectSocket();
    }
  },
  
  "socketCheck": function() {
    this.reconnectSocketIfNotConnected();
    this.pingSocket();
  },
  
  "pingSocket": function() {
    json_request = {"operation": "ping"};
    this.sendMessage(JSON.stringify(json_request));
  },
  
  "pingSocketCallback": function(message) {
    this.socket_active = new Date();
  },

  "authenticateUser": function() {
    json_request = {"operation": "authenticate", "payload": {"user_id": this.user_id, "token": this.user_auth_token, "type": "web"}};
    this.sendMessage(JSON.stringify(json_request));
  },

  "messageReceived": function(raw_data) {
    // console.log(raw_data + ' received.');
    // FIXME: Handle this in the flash socket
    if($.trim(raw_data).startsWith("<?xml")) {
      return;
    }
    
    var message = JSON.parse(raw_data);
    
    switch(message.x_target) {
      // special case: on initial successful connection this sets the socket_id
      // to the message form
      // todo: needs to be set globally
      case "socket_id":
        $('#tweet_socket_id').val(message.socket_id);
        break;
      default:
        console.log('default handling: ' + message.x_target + '(message)');
        eval(message.x_target + '(message)');
    }
  },

  "sendMessage": function(data, delimit) {
    // console.log('Trying to send: ' + data);
    if(delimit) {
      data = data + "\0";
    }
    this.socket.sendData(data);
  },

  "test": function(args) {
    console.log('dispatcher called test');
  }
  
};