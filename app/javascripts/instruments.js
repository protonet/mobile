//= require "dispatching/dispatching.js"
//= require "communication_console.js"
//= require "input_console/input_console.js"
//= require "file_widget/file_widget.js"

var cc = new CommunicationConsole({'config': config});
var Dispatcher    = new DispatchingSystem(config.dispatching_server, config.token, config.user_id);
$('document').ready(function() {
  file_widget = new FileWidget();
});
