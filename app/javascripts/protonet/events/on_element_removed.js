/**
 * @example
 *    protonet.events.onElementRemoved($("#message"), doSomething);
 */
protonet.events.onElementRemoved = function($element, callback) {
  var interval = setInterval(function() {
    if (!$.contains(document.documentElement, $element[0])) {
      clearInterval(interval);
      callback.call($element[0]);
    }
  }, 250);
};