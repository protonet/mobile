function DispatchingSystem(socket) {
  this.initSocket(socket);
}
   
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

  "messageReceived": function(data) {
    console.log(data + ' wurde empfangen.');
    // this stuff doesn't belong here, will be moved soon
    eval('var message = ' + data);
    var room = cw.getRoom(message.chat_room_id);
    var chat_message = new ChatMessage(message, room);
    if(cw.current_user_id != chat_message.user_id) {
      room.addMessage(chat_message);
      room.parent_widget.messagesLoadedCallback(room.id);      
    }
    // parsed_message = this.parseMessage(data);
    // this.dispatch(this.findDestination(parsed_message[0]), parsed_message[1])
  },

  "parseMessage": function(data) {
  
  },

  "sendMessage": function(data) {
    console.log('Versuche ' + data + ' zu senden.');
    this.socket.sendData(data);
  },

  "dispatch": function(to, data) {
    // ;)
    to(data);
  },
  
  "test": function(args) {
    console.log('dispatcher called test');
  },
  
  "socketConnectCallback": function(args) {
    console.log('connection established? ' + args);
  }

};