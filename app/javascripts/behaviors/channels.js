$.behaviors({
  "a[data-channel-id]:click": function(element, event) {
    var $element  = $(element),
        id        = +$element.data("channel-id");
    if (!id) {
      return;
    }
    if (!$element.is(".active")) {
      protonet.trigger("channel.change", id);
    }
    event.preventDefault();
  },
  "a[data-channel-id]:dragstart": function(element, event) {
    var $element = $(element);
    if (event.originalEvent.dataTransfer) {
      var channelId = $element.data("channel-id");
      event.originalEvent.dataTransfer.setData("Text", "@" + protonet.timeline.Channels.getChannelName(channelId) + " ");
    }
  }
});