// aj: still a lot of repeated code in here, but I will add necessary inheritance stuff later
// on ...

function ChatWidget(args) {
  var self = this;
    
  // get your own container
  this.div_container = args.div_container;
  this.div_container.addClass('chat-widget');
  
  // add sub views
  this.room_selector  = new ChatRoomSelector({'parent_widget': this});
  this.user_list      = new ChatUserListViewer({'parent_widget': this});
  this.room_viewer    = new ChatRoomViewer({'parent_widget': this});
  this.chat_input     = new ChatInput({'parent_widget': this});

  
  // who am I? isn't that what we all want to know? ;)
  this.current_user  = new ChatUser(args.user_id);
  this.user_config   = args.user_config;
  
  // active informations
  this.active_room_id = null;
  this.rooms = {};
  this.user_lists = {};
  
  // keep it simple, no init for now
  this.openLobby();
  
  // this.listenToUserInput();
}

ChatWidget.prototype = 
{
  "openLobby": function() {
    // just for clearness
    var lobby_room_id = 1;
    this.openRoom(lobby_room_id);
  },   
  "openRoom": function(room_id) {
    this.refreshUserListForRoom(room_id);
    this.active_room_id = room_id;
    this.room_viewer.setActive(room_id);
    this.user_list.setActive(room_id);
    // not yet implemented:
    // this.room_selector.setActive(room_id);
    // this.chat_input.setActive(room_id);
    // this.listenToRoom(foobar?);
  },
  "refreshUserListForRoom": function(room_id) {
    this.user_list.renderFor(room_id);
  },
  "listenToRoom": function() {
  },
  "receiveEventFromDispatcher": function() {
    // this.room_viewer.add_message(new ChatMessage());
  },
  "activeRoom": function() {
    return this.rooms['room_' + this.active_room_id];
  },
  "activeUserList": function() {
    return this.user_lists['room_' + this.active_room_id];
  }
}

function ChatUserListViewer(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
  this.view_element = $(document.createElement('div'));
  this.view_element.addClass('chat-user-list')
  
  this._addOwnElementToParent();
};

ChatUserListViewer.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.view_element);
  }
  "createOrReturnChatUserList": function(room_id) {
    var room_key = 'room_' + room_id;
    if(!this.parent_widget.user_lists[room_key]) {
      this.parent_widget.user_lists[room_key] = new ChatUserList(room_id, this);
    }
    return this.parent_widget.user_lists[room_key];
  },
  "setActive": function(room_id) {
    user_list = this.createOrReturnChatUserList(room_id);
    this.view_element.append(this.activeUserList().list_element);
    this.scrollToLast();
  }
};



function ChatUserList(room_id, parent_widget) {
  var self = this;
  this.room_id = room_id;
  this.parent_widget = args.parent_widget;
  this.users = [];
  this.list_element = $(document.createElement("div"));
}

ChatUserList.prototype = {
}

function ChatRoomViewer(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
  this.view_element = $(document.createElement('div'));
  this.view_element.addClass('chat-room-viewer')
  
  this._addOwnElementToParent();
};

ChatRoomViewer.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.view_element);
  }
  "createOrReturnRoom": function(room_id) {
    var room_key = 'room_' + room_id;
    if(!this.parent_widget.rooms[room_key]) {
      this.parent_widget.rooms[room_key] = new ChatRoom(room_id, this);
    }
    return this.parent_widget.rooms[room_key];
  },
  "setActive": function(room_id) {
    room = this.createOrReturnRoom(room_id);
    room.getLastMessages(true);
    this.view_element.append(this.activeRoom().room_element);
    this.scrollToLast();
  },
  "scrollToLast": function() {
    this.view_element.scrollTo(this.activeRoom().room_element.children('.message:last'));
  }
};

// switch type
// case 'Message'


function ChatRoom(room_id, parent_widget) {
  var self = this;
  this.room_id = room_id;
  this.parent_widget = parent_widget;
  this.messages = [];
  this.block_get = false;
  this.room_element = $(document.createElement("div"));
}

ChatRoom.prototype = {
  "getLastMessages": function(set_active) {
    var self = this;
    if(!this.block_get) {
      $.get("/chat_messages/index", {"room_id": this.room_id, "received_message_ids[]": this.receivedMessageIds()}, function(messages){
        messages = eval(messages);
        for(var i in messages) {
          self.appendMessage(new ChatMessage(messages[i], self));
        }
        if(set_active) {
          self.parent_widget.setActive(self.room_id);
        }
      });
    }
  },
  "receivedMessageIds": function() {
    if(this.messages.length == 0) {
      return this.messages
    }
    return $.map(this.messages, function(m){return m.id});
  },
  "appendMessage": function(message) {
    this.messages.push(message);
    this.room_element.append(message.wrapper_element);
  }
}

function ChatMessage(message, parent_widget) {
  var self = this;
  this.parent_widget = parent_widget;
  this.text = message.text;
  this.wrapper_element = $(document.createElement("div"));
  this.wrapper_element.addClass('message');
  
  this.image_element = $(document.createElement("img"));
  this.text_element  = $(document.createElement("p"));
  this.text_element.html(this.text);
  
  this.wrapper_element.append(this.image_element);
  this.wrapper_element.append(this.text_element);
}

ChatMessage.prototype = {
}

function ChatUser(args) {
  this.user_id = args.user_id;
}

ChatUser.prototype = {
  
}

function ChatInput(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
  this.input_element = $(document.createElement('input'));
  
  this._addOwnElementToParent();
  
  this.input_element.attr('size', 60) ; 
}

ChatInput.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.input_element);
  },
  "renderFor": function(room_id) {
    this.active_room_id = room_id;
  }
}

function ChatRoomSelector(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';  
  this.selector_element = $(document.createElement('div'));
  this.selector_element.addClass('chat-room-selector')
  
  this._addOwnElementToParent();
} 

ChatRoomSelector.prototype = {
  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.selector_element);
  }
}
