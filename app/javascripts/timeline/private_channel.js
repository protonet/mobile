protonet.timeline.PrivateChannel = Class.create(protonet.timeline.Channel, {
  renderTab: function($super, tabContainer) {
    $super(tabContainer);
    this.link.addClass("private");
    return this;
  }
});