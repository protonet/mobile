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
  var default_style  = {'background-color': '#192839', 'width': '700px', 'height': '500px', 'padding': '5px', 'border': '1px solid white', 'margin-left': '10px'};
  this.widget_style = args.widget_style || default_style;
  this.current_user  = new ChatUser(args.user_id);
  this.user_config   = args.user_config;
  this.div_container = args.div_container;

  // this.current_room = 
  this.room_container = this.div_container.append($(document.createElement('div')));

  this.user_list = new ChatUserList({'parent_widget': this}).init();
  this.user_list_container = this.div_container.append($(document.createElement('div')));
  
}

ChatWidget.prototype = {
  "init": function() {
    // set style
    this.div_container.css(this.widget_style);
    this.openLobby();
    // this.restoreBookmarkedRooms();
    return this;
  },

  "openLobby": function() {
    var lobby_room_id = 1;
    this.openRoom({'room_id': lobby_room_id});
  },
    
  "openRoom": function(args) {
    this.openUserListForRoom(args.room_id);
    var room = new ChatRoom({'room_id': args.room_id, 'parent_widget': this}).init();
    this.room_container.html(room.render());
    // bar bar
    // this.listenToRoom(foobar?);
  },
  
  "openUserListForRoom": function(room_id) {
    this.user_list.room_id = room_id;
    this.user_list_container.html(this.user_list.render());
  },
  
  "listenToRoom": function() {
    
  }
  
}


function ChatRoom(args) {
  var self = this;
  var default_style = {};
  this.room_style = args.room_style || default_style;
  this.parent_widget = args.parent_widget;
  this.room_id = args.room_id;
  this.current_user = this.parent_widget.current_user;
  // this.me = "<%= current_user.login %>"; // What for?
  
  
  // this.block_get = false;
  // 
  // this.received_message_ids = [<%= @lobby.messages.map{|m| m.id }.join(',') %>];
  // 
  // this.div = $("#chat");
  // this.input = $("#chat-input")
  // this.input.bind('keypress', function(e){ 
  //   if(e.which == 13) {        
  //     self.appendMessage({"text": self.input.val(), "user_id": self.current_user_id, "user_name": self.me, "room_id": self.room_id}, true);
  //     self.input.val('');
  //   }
  // });
  this.init();
};

ChatRoom.prototype = {
  
  "init": function() {
    // this.getNewMessages(true);
    this.render();
    // this.scrollToLast();
    // this.input.focus();
    return this;
  },
  
  "render": function() {
    var div = $(document.createElement('div'));
    div.css(this.room_style);
    div.html('foobar');
    return div
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
      setTimeout("c.getNewMessages(true)", 2000);
    }
  },
  
  "scrollToLast": function() {
    this.div.scrollTo(this.div.children('.message:last'));
  }
};

// switch type
// case 'Message'


function ChatMessage() {
  var self = this;
  // size must be dependent on parent widget I'd say
  var default_style = {'padding-left': '5px', 'text-align': 'left', 'border': '1px dotted white'};
  this.message_style = args.message_style || default_style;
}

ChatMessage.prototype = {
  
}

function ChatUser(args) {
  this.user_id = args.user_id;
}

ChatUser.prototype = {
  
}


function ChatUserList(args) {
  // quasi singleton ;)
  var self = this;
  var default_style = {'margin': '5px', 'height': '350px', 'width': '130px', 'border': '1px solid grey', 'float': 'left'};
  this.list_style = args.list_style || default_style;
  this.list_element = $(document.createElement('div'));
  // set element style
  this.list_element.css(this.list_style);
}

ChatUserList.prototype = {
  "init": function() {
    return this;
  },
  
  "render": function() {
    this.list_element.html('chat_user_list');
    return this.list_element.html();
  }
  
}