$.behaviors({
  "[data-user-id]:dragstart": function(element, event) {
    if (event.originalEvent.dataTransfer)  {
      var $element  = $(element),
          user      = protonet.user.getUser($element.data("user-id"));
      if (user) {
        event.originalEvent.dataTransfer.setData("Text", "@" + user.name + " ");
      }
    }
  }
});