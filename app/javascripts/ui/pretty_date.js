//= require "../utils/prettify_date.js"

(function() {
  var SELECTOR        = "time",
      ATTRIBUTE       = "title",
      INTERVAL_TIME   = 30000, // milliseconds
      elementRegistry = [],
      interval;
  
  function register(element) {
    elementRegistry.push(element);
  }
  
  function update(element) {
    var prettyDate = protonet.utils.prettifyDate(element.attr(ATTRIBUTE));
    element.html(prettyDate);
  }
  
  function updateAll() {
    $(elementRegistry).each(function(i, element) {
      update(element);
    });
  }
  
  protonet.on("meep.rendered", function(meepElement, meepData, instance) {
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
})();