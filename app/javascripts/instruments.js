//= require "dispatching/dispatching.js"
//= require "communication_console.js"
//= require "input_console/input_console.js"
//= require "file_widget/file_widget.js"
//= require "lib/jQuery.dPassword.js"
//= require "navigation.js"
//= require "lib/swfupload.js"

var cc = new CommunicationConsole({'config': config});
var Dispatcher    = new DispatchingSystem(config.dispatching_server, config.token, config.user_id);

$(function() {
  var file_widget = new protonet.controls.FileWidget();
  
  // iphonify password field 
  var registration_password_field = $('#new-user-password');
  if(registration_password_field) {
    // user creation copy the password field for the confirmation thing
    var registration_password_confirmation_field = $('#new-user-password-confirmation');
    registration_password_field.dPassword();
    $('#registration-form').submit(function(){
      registration_password_confirmation_field.val(registration_password_field.val());
    });
  }
});

