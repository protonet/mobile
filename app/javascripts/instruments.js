//= require "dispatching/dispatching.js"
//= require "controls/communication_console.js"
//= require "controls/text_extension.js"
//= require "controls/file_widget.js"
//= require "controls/endless_scroller.js"
//= require "controls/pretty_date.js"
//= require "lib/jQuery.dPassword.js"


//---------------------------- INITIALIZE INSTRUMENTS ----------------------------

// Initialize communication stuff
$(function() {
  window.cc = new protonet.controls.CommunicationConsole({"config": protonet.config});
  window.Dispatcher = new DispatchingSystem(protonet.config.dispatching_server, protonet.config.token, protonet.config.user_id);
});


// Initialize text extensions
$(function() {
  protonet.controls.TextExtension.initialize();
});


// Initialize file stuff
$(function() {
  new protonet.controls.FileWidget(window.cc);
});


// Initialize endless scrolling
$(function() {
  new protonet.controls.EndlessScroller();
});


// Initialize pretty dates ("2 minutes ago")
$(function() {
  protonet.controls.PrettyDate.initialize();
  setInterval(function() {
    protonet.controls.PrettyDate.update();
  }, 10000);
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