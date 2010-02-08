function DispatchingSystem(server, user_auth_token, user_id) {
  this.server = server;
  this.user_auth_token = user_auth_token;
  this.user_id = user_id;
  this.socketId = "flash_socket";
  this.createSocket();
}
   
DispatchingSystem.prototype = {
  
  "createSocket": function() {
    var container = $('<div id="socket-container" />').appendTo("body"),
        attributes = { id: this.socketId },
        params = { allowscriptaccess: "sameDomain" };
    
    swfobject.embedSWF(
      "/flash/socket.swf",
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
    $(window).bind('beforeunload', function(){
      this.socket.closeSocket();
    }.bind(this));
  },
    
  "connectSocket": function() {
    this.socket.connectSocket(this.server);
  },
  
  "socketConnectCallback": function(args) {
    console.log('connection established? ' + args);
    this.authenticateUser();
  },

  "authenticateUser": function() {
    json_request = {"operation": "authenticate", "payload": {"user_id": this.user_id, "token": this.user_auth_token, "type": "web"}};
    this.sendMessage(JSON.stringify(json_request));
  },

  // destination_id is your key for eventmachine/js communication
  // e.g. eventmachine sends an destination_id with each message
  // and the dispatcher finds the correct destination for this
  "addRecipient": function(destination_id, recipient_object) {
  
  },

  // maybe not needed will see
  "removeRecipient": function(destination_id) {
  
  },

  "findDestination": function(data) {

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

  "parseMessage": function(data) {
  
  },

  "sendMessage": function(data, delimit) {
    console.log('Trying to send: ' + data);
    if(delimit) {
      data = data + "\0";
    }
    this.socket.sendData(data);
  },

  "dispatch": function(to, data) {
    // ;)
    to(data);
  },
  
  "test": function(args) {
    console.log('dispatcher called test');
  }
  
};