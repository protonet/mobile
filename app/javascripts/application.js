// ---- LIBRARIES
//= require "lib/simple-javascript-airbrake-notifier/notifier.js"
//= require "lib/jquery-1.7.1.min.js"
//= require "lib/jquery-ui-1.8.11.custom.min.js"
//= require "lib/swfobject-2.2.js"
//= require "lib/jquery-class-create/class.js"
//= require "lib/jquery-behaviors/behaviors.js"
//= require "lib/jquery.inview/jquery.inview.js"

// ---- PROTONET
//= require "extensions.js"
//= require "protonet.js"
//= require "browser.js"
//= require "events/emitter.js"
//= require "storage/storage.js"
//= require "data/user.js"
//= require "data/channel.js"
//= require "data/meep.js"
//= require "dispatcher/dispatcher.js"
//= require "i18n/i18n.js"
//= require "utils/history.js"
//= require "behaviors/main.js"
//= require "behaviors/ajax.js"
//= require "utils/template.js"
//= require "utils/inline_hint.js"
//= require "ui/user.js"
//= require "ui/flash_message.js"
//= require "ui/header.js"
//= require "ui/modal_window.js"
//= require "utils/rails.js"
//= require "utils/cross_domain_xhr.js"
//= require "text_extensions/text_extensions.js"
//= require "timeline/meep.js"
//= require "effects/clouds.js"
//= require "ui/pretty_date.js"
//= require "pages/base.js"

//---------------------------- INITIALIZE APPLICATION ----------------------------

$(function() {
  protonet.ui.User.initialize();
  
  
  protonet.dispatcher.initialize();
  
  protonet.ui.FlashMessage.initialize();
  protonet.ui.Header.initialize();
  
  // Clouds
  if (protonet.config.show_clouds && !$.browser.msie) {
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
    }, (0.5).seconds());
  }
  
  if (protonet.browser.IS_TOUCH_DEVICE()) {
    $("body").addClass("touch-device");
  }
});
