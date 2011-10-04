/**
 *  protonet.utils.ensureScrollPosition(function() {
 *    // do something
 *  }).when({ scrollTopGreaterThan: 200, and: true });
 */
protonet.utils.ensureScrollPosition = (function() {
  var $window = $(window),
      $body   = $(document.body);
  return function(execute) {
    return {
      when: function(conditions) {
        var scrollTop     = $window.scrollTop(),
            conditionTrue = scrollTop > conditions.scrollTopGreaterThan && conditions.and !== false,
            oldBodyHeight,
            newBodyHeight,
            scrollChange;
        
        if (conditionTrue) {
          oldBodyHeight = $body.height();
          execute();
          newBodyHeight = $body.height();
          scrollChange  = newBodyHeight - oldBodyHeight;
          $window.scrollTop(scrollTop + scrollChange);
        } else {
          execute();
        }
      }
    };
  };
})();