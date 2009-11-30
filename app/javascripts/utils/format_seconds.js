protonet.utils.formatSeconds = (function() {
  var twoDigitize = function(num) {
    if (num < 10) {
      return "0" + num;
    }
    return num;
  };
  
  return function(num) {
    var minutes = twoDigitize(Math.floor(num / 60)),
        seconds = twoDigitize(Math.round(num % 60));
    
    return minutes + ":" + seconds;
  };
})();