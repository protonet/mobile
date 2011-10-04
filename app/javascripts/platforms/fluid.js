//= require "../utils/is_window_focused.js"
//= require "../media/proxy.js"

/**
 * Fluid turns any web page turns any web app into a desktop app
 * It offers a rich javascript api to interact with the desktop
 * More http://fluidapp.com/
 */
(function() {
  if (!window.fluid) {
    return;
  }
  
  var fluid           = window.fluid,
      unreadMessages  = 0;
  
  protonet.bind("meep.receive", function(e, meepData) {
    if (protonet.utils.isWindowFocused()) {
      return;
    }
    
    var avatar = protonet.config.base_url + meepData.avatar;
    avatar = protonet.media.Proxy.getImageUrl(avatar, { width: 36, height: 36 });
    
    unreadMessages++;
    fluid.dockBadge = unreadMessages;
    fluid.showGrowlNotification({
      title:        meepData.author,
      description:  meepData.message,
      priority:     1,
      sticky:       false,
      identifier:   "protonet-message-" + meepData.id,
      icon:         avatar
    });
  });
  
  $(window).focus(function() {
    unreadMessages = 0;
    fluid.dockBadge = "";
  });
})();