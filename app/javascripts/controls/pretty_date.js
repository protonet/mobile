//= require "../utils/convert_to_pretty_date.js"

protonet.controls.PrettyDate = (function() {
  var SELECTOR = ".pretty-date";
  
  function initialize() {
    update();
    setInterval(update, 30000);
    
    protonet.Notifications.bind("meep.render", update);
  }
  
  function update() {
    $(SELECTOR).html(function() {
      return protonet.utils.convertToPrettyDate($(this).attr("datetime"));
    });
  }
  
  return {
    initialize: initialize,
    update: update
  };
})();