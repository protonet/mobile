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
  // this handles changing the name of a channel to it's display name
  // TODO: tiff let's talk about this, I wanted to change the minimal amount of stuff so as to 
  // not interfere with the rest of the code
  "a[data-channel-display-name]": function(element, event) {
    var $element      = $(element),
        display_name  = $element.data("channel-display-name");
   $element.html(display_name)
  }
  
  // This doesn't work anymore due to a conflict with the jquery.html5sortable plugin
  // ,"a[data-channel-id]:drag": function(element, event) {
  //   var $element = $(element);
  //   if (event.originalEvent.dataTransfer) {
  //     var channelId = $element.data("channel-id");
  //     event.originalEvent.dataTransfer.setData("text/plain", "@" + protonet.timeline.Channels.getChannelName(channelId) + " ");
  //   }
  // }
});