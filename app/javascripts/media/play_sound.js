/**
 * Plays audio and caches the audio object to prevent reloading when replaying
 * Browsers support only certain audio formats that's why you might wanna pass your sound in different formats
 * This method will find the one that's compatible and play it
 *
 * @example
 *    protonet.media.playSound("sounds/notification.mp3", "sounds/notification.ogg", "sounds/notification.wav")
 */
protonet.media.playSound = (function() {
  var fileTypeRegExp = /.+\.(\w+)/,
      cache          = {};
  return function() {
    var i       = 0,
        length  = arguments.length,
        match,
        path;
    for (; i<length; i++) {
      path = arguments[i];
      if (cache[path] && typeof(cache[path].replay) === "function") {
        cache[path].replay();
        return;
      }
      match = path.match(fileTypeRegExp);
      if (match && protonet.browser.SUPPORTS_AUDIO_TYPE(match[1])) {
        (cache[path] = new Audio(path)).play();
        return;
      }
    }
  };
})();