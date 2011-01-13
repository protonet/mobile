//= require "../window/meep.js"

protonet.utils.Behaviors.add({
  "[data-meep-id]:click": function(element, event) {
    var meepId = element.data("meep-id");
    protonet.window.Meep.show(meepId);
    event.preventDefault();
  }
});