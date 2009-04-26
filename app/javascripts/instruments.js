//= require "communication_console.js"

// var Dispatcher = new DispatchingSystem(document.getElementById('flash_socket'), '<%= Merb::Config[:dispatching_server] %>', '<%= current_user.token %>', <%= current_user.id %>);
var cc = new CommunicationConsole({'config': config});
// var cw = new ChatWidget({'user_id': config.user_id, 'user_config': {}, 'div_container': $('#main-chat-widget')});

var input_console = new InputConsole({"input_console": $("#message")});
var Dispatcher    = new DispatchingSystem(document.getElementById('flash_socket'), config.dispatching_server, config.token, config.user_id);
