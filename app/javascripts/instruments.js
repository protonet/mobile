//= require "dispatching/dispatching.js"
//= require "communication_console.js"
//= require "input_console/input_console.js"
//= require "file_widget/file_widget.js"
//= require "file_widget/file_upload.js"
//= require "/lib/jquery.contextMenu.js"
//= require "file_widget/file_context_menu.js"
//= require "lib/jQuery.dPassword.js"

var cc = new CommunicationConsole({'config': protonet.config});
var Dispatcher = new DispatchingSystem(protonet.config.dispatching_server, protonet.config.token, protonet.config.user_id);

$(function() {
  var file_widget = new protonet.controls.FileWidget();
  var registration_password_field = $('#new-user-password');
  if(registration_password_field.length == 1) {
    // iphonify password field (onkeydown to avoid conflicts with inline hints)
    registration_password_field.dPassword({"showIcon": false}
  	});
    
    // user creation copy the password field for the confirmation thing
    var registration_password_confirmation_field = $('#new-user-password-confirmation');
    $('#registration-form').submit(function(){
      registration_password_confirmation_field.val(registration_password_field.val());
    });
  }
});