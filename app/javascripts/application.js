//= require "lib/jquery-1.4.min.js"
//= require "lib/jquery.hotkeys-0.7.9.min.js"
//= require "extensions.js"
//= require "protonet.js"
//= require "controls/navigation.js"
//= require "utils/inline_hint.js"
//= require "utils/notification_message.js"
//= require "utils/toggle_element.js"



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