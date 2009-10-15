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
    registration_password_field.dPassword({
      "ICON_PATH": "images/lock.png",
      "ICON_STYLES": {
        display: "inline",
        position: "absolute",
        width: "16px", height: "16px",
        margin: "3px 0 0 -25px",
        overflow: "hidden", cursor: "pointer",
        backgroundRepeat: "no-repeat"
      }
    });
    new protonet.utils.InlineHint(registration_password_field, "password");
    
    
    // user creation copy the password field for the confirmation thing
    var registration_password_confirmation_field = $('#new-user-password-confirmation');
    $('#registration-form').submit(function(){
      registration_password_confirmation_field.val(registration_password_field.val());
    });
  }
});