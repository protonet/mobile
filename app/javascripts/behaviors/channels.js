protonet.utils.Behaviors.add({
  "a[data-channel-id]:click": function(element, event) {
    var id = +element.data("channel-id");
    if (!id) {
      return;
    }
    protonet.Notifications.trigger("channel.change", id);
    event.preventDefault();
  }
  
  // This doesn't work anymore due to a conflict with the jquery.html5sortable plugin
  // ,"a[data-channel-id]:drag": function(element, event) {
  //   if (event.originalEvent.dataTransfer) {
  //     var channelId = element.data("channel-id");
  //     event.originalEvent.dataTransfer.setData("text/plain", "@" + protonet.timeline.Channels.getChannelName(channelId) + " ");
  //   }
  // }
});