protonet.timeline.SystemChannel = Class.create(protonet.timeline.Channel, {
  renderTab: function(tabContainer) {
    $super(tabContainer);
    this.link.addClass("system");
    return this;
  }
});