protonet.media.getScreenShot = (function() {
  var DEFAULT_SIZE = "s",
      KEY = "F37b57d9hhLc";
  
  return function(url, size) {
    var screenShotUrl = 
      "http://images.websnapr.com/" +
      "?size=" + (size || DEFAULT_SIZE) + 
      "&key=" + KEY +
      "&url=" + encodeURIComponent(url);
    return screenShotUrl;
  };
})();