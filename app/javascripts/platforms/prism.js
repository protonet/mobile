//= require "../utils/is_window_focused.js"
//= require "../media/proxy.js"

/**
 * Mozilla Prism turns any web page turns any web app into a desktop app
 * It offers a rich javascript api to interact with the desktop
 * More:
 *    * https://developer.mozilla.org/en/prism
 *    * http://mxr.mozilla.org/mozillasvn/source/projects/webrunner/components/public/nsIPlatformGlue.idl
 *    * http://www.salsitasoft.com/blog/2008/05/21/mozilla-prism-update/
 */
(function() {
  var prism = window.webrunner || window.platform;
  if (!prism || !prism.showNotification) {
    return;
  }
  
  var icon            = prism.icon(),
      unreadMessages  = 0;
  
  protonet.on("meep.receive", function(meepData) {
    if (protonet.utils.isWindowFocused()) {
      return;
    }
    
    if (unreadMessages === 0) {
      // Only request attention for the first incoming message while being idle
      // otherwise this will cause a blinky behavior on Windows
      prism.getAttention();
    }
    
    var avatar = protonet.config.base_url + meepData.avatar;
    // Crop image, otherwise Windows will display it in it's original size (which could be huge as a black man's dick)
    avatar = protonet.media.Proxy.getImageUrl(avatar, { width: 36, height: 36 });
    prism.showNotification(meepData.author, meepData.message, avatar);
    icon.badgeText = ++unreadMessages;
    
    // This would play a sound (we don't need this)
    // prism.sound().beep();
  });
  
  $(window).focus(function() {
    unreadMessages = 0;
    icon.badgeText = "";
  });
})();