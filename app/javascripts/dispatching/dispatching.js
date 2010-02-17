function DispatchingSystem(server, user_auth_token, user_id) {
  this.server = server;
  this.user_auth_token = user_auth_token;
  this.user_id = user_id;
  this.socketId = "flash_socket";
  this.createSocket();
}
   
DispatchingSystem.prototype = {
  "VERSION": 1, // Increase this number manually if you want to invalidate browser cache
  
  "createSocket": function() {
    var container = $('<div id="socket-container" />').appendTo("body"),
        attributes = { id: this.socketId },
        params = { allowscriptaccess: "sameDomain" };
    
    swfobject.embedSWF(
      "/flash/socket.swf?v=" + this.VERSION,
      "socket-container",
      "auto", "auto", "8",
      null, {}, params, attributes
    );
    
    this.socket = document.getElementById(this.socketId);
  },
  
  "socketReadyCallback": function() {
    console.log('socket ready, trying to establish connection');
    // todo fix this, it is double done, was needed for safari
    // for some reasons the this.socket didn't behave as if it
    // was the flash socket
    this.socket = document.getElementById(this.socketId);
    this.connectSocket();
    $(window).bind('unload', function(){
      this.socket.closeSocket();
    }.bind(this));
  },
    
  "connectSocket": function() {
    this.socket.connectSocket(this.server);
  },
  
  "socketConnectCallback": function(args) {
    console.log('connection established? ' + args);
    this.startSocketCheck();
    this.authenticateUser();
  },
  
  "startSocketCheck": function() {
    if(!this.socket_check_interval) {
      this.socket_check_interval = setInterval(function(){this.socketCheck()}.bind(this), 30000);
    }
  },
  
  "socketCheck": function() {
    if((new Date() - this.socket_active) > 60000 && !this.socket_reconnecting) {
      this.socket_reconnecting = true;
      setTimeout(function(){this.socket_reconnecting = false}.bind(this), 60000);
      console.log('socket offline');
      this.socket.closeSocket();
      this.connectSocket();
    }
    
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
    console.log(raw_data + ' wurde empfangen.');
    // FIXME: Handle this in the flash socket
    if($.trim(raw_data).startsWith("<?xml")) {
      return;
    }
    
    // FIXME: JSON is only HTML5
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
    console.log('Trying to send: ' + data);
    if(delimit) {
      data = data + "\0";
    }
    this.socket.sendData(data);
  },

  "test": function(args) {
    console.log('dispatcher called test');
  }
  
};