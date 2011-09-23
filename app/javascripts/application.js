//= require "lib/simple-javascript-airbrake-notifier/notifier.js"
//= require "lib/shimprove.1-0-1.min.js"
//= require "lib/jquery-1.6.2.min.js"
//= require "lib/jquery-ui-1.8.11.custom.min.js"
//= require "lib/swfobject-2.2.js"
//= require "lib/jquery-class-create/class.js"
//= require "lib/jquery-behaviors/behaviors.js"
//= require "extensions.js"
//= require "protonet.js"
//= require "notifications/notifications.js"
//= require "storage/storage.js"
//= require "user/user.js"
//= require "translations/translations.js"
//= require "behaviors/users.js"
//= require "behaviors/main.js"
//= require "utils/history.js"
//= require "utils/inline_hint.js"
//= require "ui/flash_message.js"
//= require "ui/logo.js"
//= require "utils/toggle_element.js"
//= require "utils/rails.js"

//---------------------------- INITIALIZE APPLICATION ----------------------------

$(function() {
  protonet.user.initialize();
  protonet.ui.FlashMessage.initialize();
  protonet.ui.Logo.initialize();
  
  var oauthMapping = {
    facebook: "/auth/facebook/callback",
    twitter:  "/auth/twitter/callback"
  };
  $(window).bind("message", function(event) {
    event = event.originalEvent;
    var payload = JSON.parse(event.data);
    if (event.origin === "http://oauth.protonet.info" && oauthMapping[payload.provider]) {
     var $form = $("<form>", { method: "post", action: oauthMapping[payload.provider] }).hide().appendTo("body");
      $("<input>", { name: "json", val: event.data }).appendTo($form);
      $("<input>", { name: "authenticity_token", val: protonet.config.authenticity_token }).appendTo($form);
      $form.submit();
    }
  });
});