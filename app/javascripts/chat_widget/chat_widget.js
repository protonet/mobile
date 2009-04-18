//= require "inputs/chat_input.js"
//= require "messages/chat_message.js"
//= require "room_selectors/chat_room_selectors.js"
//= require "rooms/chat_room.js"
//= require "rooms/chat_room_viewer.js"
//= require "user_lists/chat_user_list.js"
//= require "user_lists/chat_user_list_viewer.js"
//= require "users/chat_users.js"


function ChatWidget(args) {
  var self = this;
    
  // get your own container
  this.div_container = args.div_container;
  this.div_container.addClass('chat-widget');
  
  // add sub views
  this.room_selector    = new ChatRoomSelector({'parent_widget': this});
  this.user_list_viewer = new ChatUserListViewer({'parent_widget': this});
  this.room_viewer      = new ChatRoomViewer({'parent_widget': this});
  this.chat_input       = new ChatInput({'parent_widget': this});

  
  // who am I? isn't that what we all want to know? ;)
  
  // this.current_user  = new ChatUser(args.user_id);
  // make it a global user object
  this.current_user_id = args.user_id;
  this.user_config   = args.user_config;
  
  // active informations
  this.active_room_id = null;
  this.rooms = {};
  this.user_lists = {};
  
  // load room chooser
  // this thing is displayed by default with the currently
  // available data so it doesn't need to be dependent on the
  // room activation process
  this.activateRoomSelector();

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
    this.active_room_id = room_id;
    this.room_viewer.setActive(room_id);
    this.user_list_viewer.setActive(room_id);
    // not yet implemented:
    // this.room_selector.setActive(room_id);
    this.chat_input.setActive(room_id);
    // this.listenToRoom(foobar?);
  },
  "listenToRoom": function() {
  },
  "receiveEventFromDispatcher": function() {
    // this.room_viewer.add_message(new ChatMessage());
  },
  "getRoom": function(room_id) {
    var room_key = 'room_' + room_id;
    return this.rooms[room_key];
  },
  "addRoom": function(room) {
    var room_key = 'room_' + room.room_id;
    this.rooms[room_key] = room;
    return this.rooms[room_key];
  },
  "activateRoomSelector": function() {
    this.room_selector.setActive();
  },
  "activeRoom": function() {
    return this.rooms['room_' + this.active_room_id];
  },
  "activeUserList": function() {
    return this.user_lists['room_' + this.active_room_id];
  }
}
