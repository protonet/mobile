//= require "lib/shimprove.1-0-1.min.js"
//= require "lib/jquery-1.6.2.min.js"
//= require "lib/jquery-ui-1.8.11.custom.min.js"
//= require "lib/swfobject-2.2.js"
//= require "lib/jquery-class-create/class.js"
//= require "extensions.js"
//= require "protonet.js"
//= require "notifications/notifications.js"
//= require "user/user.js"
//= require "utils/behaviors.js"
//= require "behaviors/users.js"
//= require "behaviors/main.js"
//= require "translations/translations.js"
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
});