// ---- LIBRARIES
//= require "lib/simple-javascript-airbrake-notifier/notifier.js"
//= require "lib/jquery-1.7.2.min.js"
//= require "lib/jquery-ui-1.8.20.custom.min.js"
//= require "lib/swfobject-2.2.js"
//= require "lib/jquery-class-create/class.js"
//= require "lib/jquery-behaviors/behaviors.js"
//= require "lib/jquery.inview/jquery.inview.js"
//= require "lib/jquery-patches/src/xhr.js"
//= require "lib/jquery-patches/src/event.js"

window.$window   = $(window);
window.$document = $(document);

// ---- PROTONET
//= require "extensions.js"
//= require "protonet.js"
//= require "browser.js"
//= require "storage/storage.js"
//= require "data/user.js"
//= require "data/channel.js"
//= require "data/meep.js"
//= require "data/file.js"
//= require "dispatcher/dispatcher.js"
//= require "i18n/i18n.js"
//= require "utils/history.js"
//= require "utils/url_behaviors.js"
//= require "utils/prettify_code.js"
//= require "utils/escape_html.js"
//= require "behaviors/main.js"
//= require "behaviors/ajax.js"
//= require "media/proxy.js"
//= require "media/uploader.js"
//= require "media/audio.js"
//= require "utils/template.js"
//= require "utils/inline_hint.js"
//= require "ui/users/users.js"
//= require "ui/context_menu.js"
//= require "ui/flash_message.js"
//= require "ui/header.js"
//= require "ui/modal_window.js"
//= require "ui/droppables.js"
//= require "ui/files/queue.js"
//= require "ui/audio_player.js"
//= require "utils/rails.js"
//= require "text_extensions/text_extensions.js"
//= require "timeline/meep.js"
//= require "ui/pretty_date.js"
//= require "pages/base.js"
//= require "pages/search.js"

//---------------------------- INITIALIZE APPLICATION ----------------------------

$(function() {
  if (protonet.browser.IS_TOUCH_DEVICE()) {
    protonet.config.allow_modal_views = false;
    $("body").addClass("touch-device");
  }
  
  if ($.browser.msie && $.browser.version < 9) {
    protonet.config.allow_modal_views = false;
  }
  
  protonet.ui.FlashMessage.initialize();
  
  if (!protonet.config.popup) {
    protonet.ui.users.initialize();
    protonet.dispatcher.initialize();
    protonet.ui.Header.initialize();

    $("form .register-link, form .login-link").on("click", function() {
      $("form.login, form.register").toggle();
      return false;
    });

    if (location.hash.indexOf("register") !== -1) {
      $("form .register-link").click();
    }
  }
});
