//= require "../utils/convert_to_pretty_date.js"

protonet.controls.PrettyDate = (function() {
  var SELECTOR        = "time",
      ATTRIBUTE       = "datetime",
      INTERVAL_TIME   = 30000,
      elementRegistry = [],
      interval;
  
  protonet.Notifications.bind("meep.rendered", function(e, meepElement, meepData, instance) {
    if (instance.merged) {
      return;
    }
    var timeElement = meepElement.find(SELECTOR);
    register(timeElement);
    update(timeElement);
    
    if (!interval) {
      interval = setInterval(updateAll, INTERVAL_TIME);
    }
  });
  
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
    register:   register,
    updateAll:  updateAll,
    update:     update
  };
})();