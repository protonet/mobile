function ChatWidget(args) {
  var self = this;
    
  // get your own container
  this.div_container = args.div_container;
  this.div_container.addClass('chat-widget');
  
  // add sub views
  this.user_list    = new ChatUserList({'parent_widget': this});    
  this.room_display = new ChatRoomDisplay({'parent_widget': this});
  
  // who am I? isn't that what we all want to know? ;)
  this.current_user  = new ChatUser(args.user_id);
  this.user_config   = args.user_config;
  
  // keep it simple, no init for now
  this.openLobby();
  
  // this.listenToUserInput();
}

ChatWidget.prototype = {

  "openLobby": function() {
    // just for clearness
    var lobby_room_id = 1;
    this.openRoom(lobby_room_id);
  },
    
  "openRoom": function(room_id) {
    this.refreshUserListForRoom(room_id);
    this.room_display.renderFor(room_id);
    // this.listenToRoom(foobar?);
  },
  
  "refreshUserListForRoom": function(room_id) {
    this.user_list.render_for(room_id);
  },
  
  "listenToRoom": function() {
    
  }
  
}


function ChatRoomDisplay(args) {
  var self = this;
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
    
  this.wrapper      = this._createViewElement('chat-room-wrapper');
  this.room_chooser = this._createViewElement('chat-room-chooser');
  this.room_viewer  = this._createViewElement('chat-room-viewer');
  this.input        = this._createInputElement();
  
  this._addWrapperToParent();
  this._addElementsToWrapper([this.room_chooser, this.room_viewer, this.input]);
};

ChatRoomDisplay.prototype = {
  
  "_createViewElement": function(name) {
    var element = $(document.createElement('div'));
    element.addClass(name);
    return element
  },
  
  "_createInputElement": function() {
    return $(document.createElement('input'));
  },
  
  "_addWrapperToParent": function() {  
    this.parent_widget.div_container.append(this.wrapper);
  },
  
  "_addElementsToWrapper": function(elements) {
    for(i in elements) {
      this.wrapper.append(elements[i]);
    }
  },
    
  "renderFor": function(room_id) {
    
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
  this.parent_widget = args.parent_widget;
  if(!this.parent_widget)
    throw 'parent widget not given';
    
  // maybe move this to a function
  this.list_element = $(document.createElement('div'));
  this.list_element.addClass('chat-user-list');
  
  this._addOwnElementToParent();
  
  
}

ChatUserList.prototype = {

  "_addOwnElementToParent": function() {
    this.parent_widget.div_container.append(this.list_element);
  },
  
  "render_for": function(room_id) {
    // this.list_element.html(room_id);
  }
  
}



function ChatDispatcher() {
  
}

ChatDispatcher.prototype = {
  
  "receive": function(data) {
    this.findDestination(data.destination)
    
  },
  
  "findDestination": function(destination) {
      
    
  }
  
}
