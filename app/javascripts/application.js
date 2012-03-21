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
//= require "data/file.js"
//= require "dispatcher/dispatcher.js"
//= require "i18n/i18n.js"
//= require "utils/history.js"
//= require "behaviors/main.js"
//= require "behaviors/ajax.js"
//= require "media/proxy.js"
//= require "media/uploader.js"
//= require "utils/template.js"
//= require "utils/inline_hint.js"
//= require "ui/user.js"
//= require "ui/context_menu.js"
//= require "ui/flash_message.js"
//= require "ui/header.js"
//= require "ui/modal_window.js"
//= require "utils/rails.js"
//= require "utils/cross_domain_xhr.js"
//= require "text_extensions/text_extensions.js"
//= require "timeline/meep.js"
//= require "ui/pretty_date.js"
//= require "pages/base.js"
//= require "pages/search.js"

//---------------------------- INITIALIZE APPLICATION ----------------------------

$(function() {
  protonet.ui.User.initialize();
  
  protonet.dispatcher.initialize();
  
  protonet.ui.FlashMessage.initialize();
  protonet.ui.Header.initialize();
  
  $("form .register-link, form .login-link").bind("click", function() {
    $("form.login, form.register").toggle();
    return false;
  });
  
  if (location.hash.indexOf("register") !== -1) {
    $("form .register-link").click();
  }
  
  if (protonet.browser.IS_TOUCH_DEVICE()) {
    $("body").addClass("touch-device");
  }
});
