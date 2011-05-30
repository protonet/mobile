protonet.effects.scale = (function() {
  var defaultOptions = {
    from:     0,
    to:       1,
    duration: 1000,
    callback: $.noop,
  };
  
  var transitionTemplate  = "opacity {duration}s linear, -webkit-transform {duration}s linear";
  
  var scaleTemplate       = "scale({value})";
  
  return function(element, options) {
    options = $.extend({}, defaultOptions, options);
    
    element.css({
      "opacity":            options.from,
      "-webkit-transform": scaleTemplate.replace(/\{value\}/g, options.from),
      "-webkit-transition": transitionTemplate.replace(/\{duration\}/g, options.duration / 1000)
    });
    
    element.bind("webkitTransitionEnd.scale_effect", options.callback);
    
    setTimeout(function() {
      element.css({
        "opacity":            options.to,
        "-webkit-transform": scaleTemplate.replace(/\{value\}/g, options.to)
      });
    }, 0);
  };
})();