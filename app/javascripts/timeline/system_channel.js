protonet.timeline.SystemChannel = Class.create(protonet.timeline.Channel, {
  renderTab: function($super, tabContainer) {
    $super(tabContainer);
    this.link.addClass("system");
    return this;
  },
  
  _replyNotifications: function(meepData) {
    var isWindowFocused             = protonet.utils.isWindowFocused(),
        isAllowedToDoNotifications  = protonet.data.User.getPreference("reply_notification"),
        isSystem                    = meepData.author === "System";
    
    if (!isWindowFocused && isAllowedToDoNotifications && isSystem) {
      new protonet.ui.Notification({
        image:    meepData.avatar,
        title:    protonet.t("SYSTEM_NOTIFICATION_TITLE"),
        text:     meepData.message.truncate(140),
        onclick:  function() {
          protonet.trigger("channel.change", this.data.id);
        }.bind(this)
      });
    }
  }
});