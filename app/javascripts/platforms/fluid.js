//= require "../utils/is_window_focused.js"

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
  
  protonet.Notifications.bind("meep.receive", function(e, meepData) {
    if (protonet.utils.isWindowFocused()) {
      return;
    }
    
    unreadMessages++;
    fluid.dockBadge = unreadMessages;
    fluid.showGrowlNotification({
      title:        meepData.author,
      description:  meepData.message,
      priority:     1,
      sticky:       false,
      identifier:   "protonet-message-" + meepData.id,
      icon:         protonet.config.base_url + "/" + meepData.avatar
    });
  });
  
  $(window).focus(function() {
    unreadMessages = 0;
    fluid.dockBadge = "";
  });
})();