$.behaviors({
  "[data-user-id]:dragstart": function(element, event) {
    if (event.originalEvent.dataTransfer)  {
      var $element  = $(element),
          userName  = $element.data("user-name") || protonet.user.getUser($element.data("user-id")).name;
      event.originalEvent.dataTransfer.setData("text/plain", "@" + userName + " ");
    }
  }
});