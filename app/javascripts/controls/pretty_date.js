//= require "../utils/convert_to_pretty_date.js"

protonet.controls.PrettyDate = (function() {
  var SELECTOR  = ".pretty-date",
      INTERVAL  = 30000,
      dateObj   = new Date();
  
  function initialize() {
    setInterval(function() {
      update();
    }, INTERVAL);
    
    protonet.Notifications.bind("meep.rendered", function(e, meepElement) {
      update(meepElement);
    });
    
    update();
  }
  
  function update(container) {
    $(SELECTOR, container).html(function() {
      var date = dateObj.setISO8601($(this).attr("datetime"));
      return protonet.utils.convertToPrettyDate(date);
    });
  }
  
  return {
    initialize: initialize,
    update:     update
  };
})();