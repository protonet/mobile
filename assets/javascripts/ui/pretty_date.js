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
  
  protonet.on("meep.rendered", function(meepElement, meepData) {
    var timeElement = meepElement.find("time");
    register(timeElement);
    update(timeElement);
    startInterval();
  });

  protonet.on("dashboard.updated", function(dashboard){
    var timeElements = dashboard.$channelList.find("time");
    $.each(timeElements, function(i, timeElement){
      var $el = $(timeElement);
      register($el);
      update($el);
    });
    startInterval();
  });
  
})();