protonet.effects.blink = (function() {
  var defaultConfig = {
    "class":    "blink",
    interval:   (0.25).seconds(),
    delay:      (0).seconds(),
    times:      2,
    callback:   $.noop
  };
  
  return function($element, config) {
    config = $.extend({}, defaultConfig, config);
    
    var className = config["class"],
        i         = 0,
        timeout,
        interval;
    
    timeout = setTimeout(function() {
      interval = setInterval(function() {
        if (i >= config.times) {
          config.callback();
          clearInterval(interval);
          return;
        }

        if ($element.hasClass(className)) {
          $element.removeClass(className);
          i++;
        } else {
          $element.addClass(className);
        }
      }, config.interval);
    }, config.delay);
    
    return {
      stop: function() {
        clearTimeout(timeout);
        clearInterval(interval);
        $element.removeClass(className);
      }
    };
  };
})();