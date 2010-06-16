//= require "../utils/convert_to_pretty_date.js"

protonet.controls.PrettyDate = (function() {
  var SELECTOR = ".pretty-date[title]";
  
  function initialize() {
    update();
  }
  
  function update() {
    $(SELECTOR).html(function() {
      return protonet.utils.convertToPrettyDate(this.title);
    });
  }
  
  protonet.Notifications.bind("messages.new", update);
  
  return {
    initialize: initialize,
    update: update
  };
})();