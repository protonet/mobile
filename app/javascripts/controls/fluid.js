protonet.controls.Fluid = function() {
  this.fluid = window.fluid;
  this.unreadMessages = 0;
  
  $(protonet.globals.communicationConsole).bind("new_message", function(e, message) {
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
  
  $(protonet.globals.communicationConsole).bind("reset_messages", function() {
    this.unreadMessages = 0;
    this.fluid.dockBadge = "";
  }.bind(this));
};