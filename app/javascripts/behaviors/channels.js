protonet.utils.Behaviors.add({
  "a[data-channel-id]:click": function(element, event) {
    var id = +element.attr("data-channel-id");
    if (!id) {
      return;
    }
    protonet.Notifications.trigger("channel.change", id);
    event.preventDefault();
  },
  
  // "a[data-channel-id]:dragstart": function(element, event) {
  //   if (event.originalEvent.dataTransfer) {
  //     var channelId = element.attr("data-channel-id");
  //     event.originalEvent.dataTransfer.setData("text/plain", "@" + protonet.timeline.Channels.getChannelName(channelId) + " ");
  //   }
  // }
});