function DispatchingSystem(server, user_auth_token, user_id) {
  // this.socket = socket;
  this.createSocket;
  this.server = server;
  this.user_auth_token = user_auth_token;
  this.user_id = user_id;
}
   
DispatchingSystem.prototype = {
  
  "createSocket": function() {
    // var socket = '<!-- MESSAGING SOCKET --><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1" height="1" align="middle"><param name="allowScriptAccess" value="sameDomain"><param name="movie" value="flash/socket.swf"><param name="quality" value="high"><param name="bgcolor" value="#FFFFFF">        <embed id="flash_socket" src="/flash/socket.swf" quality="high" bgcolor="#FFFFFF" width="1" height="1" name="flash_socket" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer">    </object><!-- END OF MESSAGING SOCKET -->';
    // $('body').append(socket);
    // this.socket = document.getElementById('flash_socket');
  },
  
  "socketReadyCallback": function() {
    console.log('socket ready, trying to establish connection');
    this.connectSocket();
  },
    
  "connectSocket": function() {
    this.socket.connectSocket(this.server);
  },
  
  "socketConnectCallback": function(args) {
    console.log('connection established? ' + args);
    // doing this because a new socket has been opened after the initial opening (flash does that for policy handling) 
    // and the first response is a policy response by default
    this.sendMessage('foo', true);
    this.authenticateUser();
  },

  "authenticateUser": function() {
    this.sendMessage('auth_response:' + '{"user_id":' + this.user_id + ', "token":"' + this.user_auth_token + '"}');
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
    
    var destination = raw_data.match(/^.*?_/)[0];
    var data = raw_data.replace(/.*?_/, "");
    console.log(data + " after replacing");
    
    switch(destination) {
    case "chats_": 
      // this stuff doesn't belong here, will be moved soon
      eval('var message = ' + data);
      var room = cw.getRoom(message.chat_room_id);
      var chat_message = new ChatMessage(message, room);
      if(cw.current_user_id != chat_message.user_id) {
        room.addMessage(chat_message);
      }
      room.parent_widget.messagesLoadedCallback(room.id);
      // parsed_message = this.parseMessage(data);
      // this.dispatch(this.findDestination(parsed_message[0]), parsed_message[1])
      break;
    case "assets_":
      eval('var asset = ' + data);
      var link = document.createElement("a");
      var list_element = document.createElement("li");
      link.innerHTML = asset.filename;
      list_element.appendChild(link);
      link.href = "/uploads/" + asset.filename;
      $("#file-list").append($(list_element));
      break;
    }
  },

  "parseMessage": function(data) {
  
  },

  "sendMessage": function(data, delimit) {
    console.log('Versuche ' + data + ' zu senden.');
    if(delimit) {
      data = data + "\0"
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