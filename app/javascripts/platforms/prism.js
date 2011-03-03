//= require "../utils/is_window_focused.js"

/**
 * Mozilla Prism turns any web page turns any web app into a desktop app
 * It offers a rich javascript api to interact with the desktop
 * More:
 *    * https://developer.mozilla.org/en/prism
 *    * http://mxr.mozilla.org/mozillasvn/source/projects/webrunner/components/public/nsIPlatformGlue.idl
 *    * http://www.salsitasoft.com/blog/2008/05/21/mozilla-prism-update/
 */
(function() {
  if (!window.platform || !window.platform.showNotification) {
    return;
  }
  
  var prism           = window.platform,
      icon            = prism.icon(),
      unreadMessages  = 0;
  
  protonet.Notifications.bind("meep.receive", function(e, meepData) {
    if (protonet.utils.isWindowFocused()) {
      return;
    }
    
    unreadMessages++;
    prism.getAttention();
    prism.showNotification(meepData.author, meepData.message, protonet.config.base_url + "/" + meepData.avatar);
    icon.badgeText = unreadMessages;
    // This would play a sound (we don't need this)
    // prism.sound().beep();
  });
  
  $(window).focus(function() {
    unreadMessages = 0;
    icon.badgeText = "";
  });
})();