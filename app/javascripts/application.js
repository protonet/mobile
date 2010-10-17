//= require "lib/jquery-1.4.3.min.js"
//= require "lib/jquery.jsonp-1.1.3.min.js"
//= require "lib/json.min.js"
//= require "lib/swfobject-2.2.js"
//= require "extensions.js"
//= require "protonet.js"
//= require "notifications/notifications.js"
//= require "user/user.js"
//= require "translations/translations.js"
//= require "utils/inline_hint.js"
//= require "ui/flash_message.js"
//= require "ui/logo.js"
//= require "utils/toggle_element.js"

//---------------------------- INITIALIZE APPLICATION ----------------------------

$(function() {
  protonet.user.initialize();
  
  // Inline hints
  $("input:text[title], input:password[title], textarea[title]").each(function() {
    var input = $(this);
    new protonet.utils.InlineHint(input, input.attr("title"));
  });
  
  // add notification message neatification
  protonet.ui.FlashMessage.initialize();
  
  protonet.ui.Logo.initialize();
});