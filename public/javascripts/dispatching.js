function DispatchingSystem() {}
   
DispatchingSystem.prototype = {
  "initSocket": function(socket_object) {
    this.socket = socket_object;
  },

  // destination_id is your key for eventmachine/js communication
  // e.g. eventmachine sends an destination_id with each message
  // and the dispatcher finds the correct destination for this
  "addRecipient": function(destination_id, recipient_object) {
  
  },

  // maybe not needed will see
  "removeRecipient": function(destination_id) {
  
  },

  "findDestination": function(destination_id) {
  
  },

  "receiveMessage": function(data) {
    console.log(data + ' wurde empfangen.');
    // parsed_message = this.parseMessage(data);
    // this.dispatch(this.findDestination(parsed_message[0]), parsed_message[1])
  },

  "parseMessage": function(data) {
  
  },

  "sendMessage": function(data) {
    console.log('Versuche ' + data + ' zu senden.');
    this.socket.socket_send(data);
  },

  "dispatch": function(to, data) {
    // ;)
    to(data);
  }

}

var Dispatcher = new DispatchingSystem();