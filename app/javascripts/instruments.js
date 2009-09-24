//= require "dispatching/dispatching.js"
//= require "communication_console.js"
//= require "input_console/input_console.js"
//= require "file_widget/file_widget.js"
//= require "lib/jQuery.dPassword.js"

var cc = new CommunicationConsole({'config': config});
var Dispatcher    = new DispatchingSystem(config.dispatching_server, config.token, config.user_id);
$('document').ready(function() {
  file_widget = new FileWidget();
  

  var registration_password_confirmation_field = $('#new-user-password-confirmation');
  var registration_password_field = $('#new-user-password');

  // iphonify password field
  registration_password_field.dPassword();
  
  // user creation copy the password field for the confirmation thing
  $('#registration-form').submit(function(){
    registration_password_confirmation_field.val(registration_password_field.val());
  });
  // 
});

