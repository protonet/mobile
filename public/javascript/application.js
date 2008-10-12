function ChatDispatcher() {
  
}

ChatDispatcher.prototype = {
  
  "receive": function(data) {
    this.findDestination(data.destination)
    
  },
  
  "findDestination": function(destination) {
      
    
  }
  
}


function ChatWidget(args) {
  var self = this;
  this.user_config = args.user_config;
}

ChatWidget.prototype = {
  "initialize": function() {
    this.subscribeToDispatcher();
    this.openLobby();
    this.restoreBookmarkedRooms();
  },
  
  'subscribeToDispatcher': function() {
    
  },

  "openLobby": function() {
    this.openRoom();
  },
  
  "openRoom": function(foobar?) {
    var room = new ChatRoom({'room_id': 1, 'parent_widget': this}).initialize();
    // bar bar
    this.listenToRoom(foobar?);
  },
  
  "listenToRoom": function() {
    
  }
  
}


function ChatRoom(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  this.room_id = args.room_id; // currently only the room with the id 1
  this.current_user_id = <%= current_user.id %>;
  this.me = "<%= current_user.login %>";
  
  this.block_get = false;
  
  this.received_message_ids = [<%= @lobby.messages.map{|m| m.id }.join(',') %>];
  
  this.div = $("#chat");
  this.input = $("#chat-input")
  this.input.bind('keypress', function(e){ 
    if(e.which == 13) {        
      self.appendMessage({"text": self.input.val(), "user_id": self.current_user_id, "user_name": self.me, "room_id": self.room_id}, true);
      self.input.val('');
    }
  });
  this.initialize();
};

ChatRoom.prototype = {
  
  "initialize": function() {
    this.getNewMessages(true);
    this.scrollToLast();
    this.input.focus();
    return this;
  },
  
  "appendMessage": function(message, send) {
    if(send) {
      this.sendMessage(message);
    } else if(message.id) {
      this.received_message_ids.push(parseInt(message.id));
    }      
    var last = this.div.append('<div style="padding-left: 5px; text-align: left; border: 1px dotted white;" class="message"><span class="who" style="color: yellow;">' + message.user_name + '</span>:&nbsp;<span>' + message.text + '</span></div>')
    this.scrollToLast();
  },

  "sendMessage": function(message) {
    var self = this;
    self.block_get = true;
    $.post("/chat_messages", { "room_id": message.room_id, "user_id": message.user_id, "text" : message.text, "received_message_ids": this.received_message_ids }, function(m_id){self.received_message_ids.push(parseInt(m_id)); self.block_get = false;});
  },
  
  "getNewMessages": function(timeout) {
    var self = this;
    if(!this.block_get) {
      $.get("/chat_messages/index", {"room_id": this.room_id, "received_message_ids[]": this.received_message_ids}, function(messages){
        messages = eval(messages);
        for(var i in messages) {
          self.appendMessage(messages[i]);
        } 
      });        
    }

    if(timeout) {
      setTimeout("c.getNewMessages(true)", 800);
    }
  },
  
  "scrollToLast": function() {
    this.div.scrollTo(this.div.children('.message:last'));
  }
};

// switch type
// case 'Message'


function ChatMessage() {
  
}

ChatMessage.prototype = {
  
}

function ChatUser() {
  
}

ChatUser.prototype = {
  
}
