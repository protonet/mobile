/**
 * Calculates the pixel width of the browser's scroll bar
 *
 * @example
 *    protonet.utils.getScrollbarWidth();
 *    // => returns something like "20"
 */
protonet.utils.getScrollbarWidth = (function() {
  var CACHED_WIDTH;
  return function() {
    if (typeof(CACHED_WIDTH) == "undefined") {
      var testElement1, testElement2, testElements;
      
      testElement1 = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
      testElement2 = testElement1.clone().css("overflow", "scroll");
      testElements = testElement1.add(testElement2).appendTo("body");
      CACHED_WIDTH = (testElement1[0].clientWidth - testElement2[0].clientWidth);
      testElements.detach();
    }
    
    return CACHED_WIDTH;
  };
})();