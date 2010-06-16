//= require "lib/jquery-1.4.2.min.js"
//= require "lib/jquery.jsonp-1.1.3.min.js"
//= require "lib/json.min.js"
//= require "lib/swfobject-2.2.js"
//= require "extensions.js"
//= require "protonet.js"
//= require "controls/navigation.js"
//= require "utils/inline_hint.js"
//= require "utils/notification_message.js"
//= require "utils/toggle_element.js"
//= require "lib/jQuery.dPassword.js"

//---------------------------- INITIALIZE APPLICATION ----------------------------

// add inline hints
$(function() {
  $("input:text[title], input:password[title], textarea[title]").each(function() {
    var input = $(this);
    new protonet.utils.InlineHint(input, input.attr("title"));
  });
});


// add notification message neatification
$(function() {
  new protonet.utils.NotificationMessage();
});


// initialize stunning Navigation
$(function() {
  protonet.controls.Navigation.initialize();
});

// Initialize password stuff for registration forms wherever they may appear
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