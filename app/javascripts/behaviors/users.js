protonet.utils.Behaviors.add({
  "[data-user-id]:dragstart, [data-user-name]:dragstart, ": function(element, event) {
    if (event.originalEvent.dataTransfer)  {
      var userName = element.data("user-name") || protonet.user.getUserName(element.data("user-id"));
      event.originalEvent.dataTransfer.setData("text/plain", "@" + userName + " ");
    }
  }
});