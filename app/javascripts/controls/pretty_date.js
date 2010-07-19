//= require "../utils/convert_to_pretty_date.js"

protonet.controls.PrettyDate = (function() {
  var SELECTOR        = "time",
      ATTRIBUTE       = "datetime",
      INTERVAL        = 30000,
      elementRegistry = [];
  
  function initialize() {
    setInterval(updateAll, INTERVAL);
    
    protonet.Notifications.bind("meep.rendered", function(e, meepElement) {
      var timeElement = meepElement.find("time");
      register(timeElement);
      update(timeElement);
    });
  }
  
  function register(element) {
    elementRegistry.push(element);
  }
  
  function updateAll() {
    $(elementRegistry).each(function(i, element) {
      update(element);
    });
  }
  
  function update(element) {
    var prettyDate = protonet.utils.convertToPrettyDate(element.attr(ATTRIBUTE));
    element.html(prettyDate);
  }
  
  return {
    initialize: initialize,
    register:   register,
    updateAll:  updateAll,
    update:     update
  };
})();