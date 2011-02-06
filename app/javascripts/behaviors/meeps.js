protonet.utils.Behaviors.add({
  "[data-meep-id]:click": function(element, event) {
    var data = element.parents("article").data("meep");
    protonet.window.Meep.show(data);
    event.preventDefault();
  }
});