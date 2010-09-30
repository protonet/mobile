//= require "../utils/is_window_focused.js"

protonet.controls.Fluid = function() {
  this.fluid = window.fluid;
  this.unreadMessages = 0;
  
  protonet.Notifications.bind("meep.receive", function(e, meepData) {
    if (protonet.utils.isWindowFocused()) {
      return;
    }
    
    this.unreadMessages++;
    this.fluid.dockBadge = this.unreadMessages;
    this.fluid.showGrowlNotification({
      title: meepData.author, 
      description: meepData.message,
      priority: 1,
      sticky: false,
      identifier: "protonet-message-" + meepData.id,
      icon: protonet.config.base_url + "/" + meepData.avatar
    });
  }.bind(this));
  
  $(window).focus(function() {
    this.unreadMessages = 0;
    this.fluid.dockBadge = "";
  }.bind(this));
};