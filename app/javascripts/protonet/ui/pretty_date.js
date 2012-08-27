//= require "../utils/prettify_date.js"

(function() {
  var ATTRIBUTE       = "title",
      INTERVAL_TIME   = 30000, // milliseconds
      elementRegistry = [],
      interval;
  
  function register(element) {
    elementRegistry.push(element);
  }
  
  function update(element) {
    var prettyDate = protonet.utils.prettifyDate(element.attr(ATTRIBUTE));
    element.text(prettyDate);
  }
  
  function updateAll() {
    $(elementRegistry).each(function(i, element) {
      update(element);
    });
  }
  
  function startInterval() {
    if (!interval) {
      interval = setInterval(updateAll, INTERVAL_TIME);
    }
  }
  
  protonet.on("meep.rendered", function(meepElement, meepData, instance) {
    if (instance.merged) {
      return;
    }
    var timeElement = meepElement.find("time");
    register(timeElement);
    update(timeElement);
    startInterval();
  });
  
  protonet.on("file.rendered", function(fileElement) {
    var timeElement = fileElement.find(".file-modified");
    register(timeElement);
    update(timeElement);
    startInterval();
  });
})();