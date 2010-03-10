//= require "dispatching/dispatching_system.js"
//= require "controls/communication_console.js"
//= require "controls/text_extension.js"
//= require "controls/file_widget.js"
//= require "controls/endless_scroller.js"
//= require "controls/user_widget.js"
//= require "controls/pretty_date.js"
//= require "lib/jQuery.dPassword.js"


//---------------------------- INITIALIZE INSTRUMENTS ----------------------------

// Initialize communication stuff
$(function() {
  protonet.globals.communicationConsole = new protonet.controls.CommunicationConsole();
  protonet.globals.dispatcher = new protonet.dispatching.DispatchingSystem();
});


// Initialize text extensions
$(function() {
  protonet.controls.TextExtension.initialize();
});


// Initialize file stuff
$(function() {
  protonet.globals.fileWidget = new protonet.controls.FileWidget();
});


// Initialize endless scrolling
$(function() {
  protonet.globals.endlessScroller = new protonet.controls.EndlessScroller();
});

// Initialize user widget
$(function() {
  protonet.globals.userWidget = new protonet.controls.UserWidget();
});


// Initialize pretty dates ("2 minutes ago")
$(function() {
  protonet.controls.PrettyDate.initialize();
  setInterval(function() {
    protonet.controls.PrettyDate.update();
  }, 30000);
});


// Initialize password stuff
$(function() {
  var registration_password_field = $("#new-user-password");
  if (registration_password_field.length < 1) {
    return;
  }
  
  registration_password_field.dPassword({
    "ICON_PATH": "images/lock.png",
    "ICON_STYLES": {
      display: "inline",
      position: "absolute",
      width: "16px", height: "16px",
      margin: "2px 0 0 -25px",
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
});