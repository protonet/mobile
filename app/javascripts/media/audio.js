//= require "../lib/soundmanager2/soundmanager2-nodebug-jsmin.js"

/**
 * @example
 *    var audio = protonet.media.Audio("sounds/notification.mp3");
 *    audio.play();
 */
(function() {
  soundManager.url = "/flash/";
  soundManager.flashVersion = 9;
  soundManager.flash9Options.useWaveformData = true;
  soundManager.flash9Options.useEQData = true;
  soundManager.flash9Options.usePeakData = true;
  soundManager.preferFlash = true;
  soundManager.useHTML5Audio = true;
  soundManager.debugMode = false;
  soundManager.noSWFCache = true;
  soundManager.html5PollingInterval = 80;
  soundManager.useHighPerformance = true;
  
  // We have to insert the flash outside the body in firefox, otherwise the flash gets reloaded as soon as you
  // change the css overflow property of the body element
  // see https://bugzilla.mozilla.org/show_bug.cgi?id=90268
  // (fixed in firefox 13)
  var hasOverflowIssue = ($.browser.mozilla && !!window.globalStorage) || $.browser.msie;
  if (hasOverflowIssue) {
    soundManager.oninitmovie = function() {
      $("#sm2-container").appendTo("html");
    };
  }
  
  var id = 1;
  
  var cache = {};
  
  protonet.media.Audio = Class.create({
    initialize: function(src) {
      if (cache[src]) {
        this.sound = cache[src];
      } else {
        this.sound = soundManager.createSound({
          url: src,
          id:  "soundmanager-" + id++
        });

        cache[src] = this.sound;
      }
    },
    
    play: function() {
      this.sound.play();
    }
  });
  
  protonet.media.Audio.canPlay = function(url) {
    var origOk = soundManager.ok;
    soundManager.ok = function() { return true; };
    var returnValue = soundManager.canPlayURL(url);
    soundManager.ok = origOk;
    return returnValue;
  };
})();