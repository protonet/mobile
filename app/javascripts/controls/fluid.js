//= require "../utils/is_window_focused.js"

protonet.controls.Fluid = function() {
  this.fluid = window.fluid;
  this.unreadMessages = 0;
  
  protonet.Notifications.bind("message.new", function(e, message) {
    if (protonet.utils.isWindowFocused()) {
      return;
    }
    
    this.unreadMessages++;
    this.fluid.dockBadge = this.unreadMessages;
    this.fluid.showGrowlNotification({
      title: message.author, 
      description: message.message, 
      priority: 1,
      sticky: false,
      identifier: "protonet-message-" + message.id,
      icon: protonet.config.base_url + "/" + message.user_icon_url
    });
  }.bind(this));
  
  $(window).focus(function() {
    this.unreadMessages = 0;
    this.fluid.dockBadge = "";
  }.bind(this));
};