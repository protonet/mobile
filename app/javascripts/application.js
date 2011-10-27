// ---- LIBRARIES
//= require "lib/simple-javascript-airbrake-notifier/notifier.js"
//= require "lib/jquery-1.7.min.js"
//= require "lib/jquery-ui-1.8.11.custom.min.js"
//= require "lib/swfobject-2.2.js"
//= require "lib/jquery-class-create/class.js"
//= require "lib/jquery-behaviors/behaviors.js"
//= require "lib/jquery.inview/jquery.inview.js"

// ---- PROTONET
//= require "extensions.js"
//= require "protonet.js"
//= require "events/emitter.js"
//= require "storage/storage.js"
//= require "user/user.js"
//= require "dispatcher/dispatcher.js"
//= require "i18n/i18n.js"
//= require "utils/history.js"
//= require "behaviors/main.js"
//= require "behaviors/ajax.js"
//= require "utils/inline_hint.js"
//= require "ui/flash_message.js"
//= require "ui/logo.js"
//= require "ui/modal_window.js"
//= require "utils/toggle_element.js"
//= require "utils/rails.js"
//= require "text_extensions/text_extensions.js"
//= require "timeline/meep.js"
//= require "effects/clouds.js"

//---------------------------- INITIALIZE APPLICATION ----------------------------

$(function() {
  protonet.user.initialize();
  protonet.ui.FlashMessage.initialize();
  protonet.ui.Logo.initialize();
  
  // Clouds
  if (protonet.config.show_clouds) {
    // Frickin' stunning cloud graphics (makes your squirrel run in circles!!)
    setTimeout(function() {
      new protonet.effects.Clouds($("#cloud-container"), {
        minStartPosition: -10,
        maxStartPosition: 90,
        minSize:          10,
        maxSize:          50,
        amount:           25,
        animated:         false
      });
    }, 100);
  }
  
  // Facebook/Twitter Connect
  if (protonet.user.Browser.SUPPORTS_POST_MESSAGE_BETWEEN_POPUPS()) {
    $("a.external-login").css("display", "inline-block");
    
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
  }
});