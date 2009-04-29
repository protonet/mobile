//= require "dispatching/dispatching.js"
//= require "communication_console.js"
//= require "input_console/input_console.js"

var cc = new CommunicationConsole({'config': config});
var Dispatcher    = new DispatchingSystem(config.dispatching_server, config.token, config.user_id);

