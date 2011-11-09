protonet.user.Browser = {
  SUPPORTS_HTML5_WEBSOCKET: function() {
    return !!window.WebSocket;
  },
  
  SUPPORTS_HTML5_AUDIO: function() {
    return (/function|object/).test(typeof(window.Audio)) && "canPlayType" in new window.Audio();
  },
  
  SUPPORTS_AUDIO_TYPE: (function() {
    var fileTypeMapping = { "mp3": "audio/mpeg" },
        audio;
    return function(fileType) {
      if (!this.SUPPORTS_HTML5_AUDIO()) {
        return false;
      }
      
      audio = audio || new Audio();
      return audio.canPlayType(fileTypeMapping[fileType] || "audio/" + fileType);
    };
  })(),
  
  SUPPORTS_POST_MESSAGE_BETWEEN_POPUPS: function() {
    // window.DOMParser is only supported in IE versions 9+
    // IE 8 supports postMessage but not between popups
    return "postMessage" in window && "DOMParser" in window;
  },
  
  SUPPORTS_NOTIFICATIONS: function() {
    return "webkitNotifications" in window;
  },
  
  SUPPORTS_EVENT: (function() {
    // Some events are hard/impossible to feature-detect
    var browserSniffing = {
      "DOMMouseScroll": $.browser.mozilla
    };
    
    return function(eventName) {
      if (browserSniffing[eventName]) {
        return true;
      }
      
      var testElement = document.createElement("div");
      eventName = "on" + eventName;
      var isSupported = (eventName in testElement);
      if (!isSupported) {
        testElement.setAttribute(eventName, "return;");
        isSupported = typeof(testElement[eventName]) == "function";
      }
      testElement = null;
      return isSupported;
    };
  })(),
  
  IS_TOUCH_DEVICE: function() {
    var returnValue;
    try {
      document.createEvent("TouchEvent");
      returnValue = true;
    } catch (e) {
      returnValue = false;
    }
    this.IS_TOUCH_DEVICE = function() { return returnValue; };
    return returnValue;
  },
  
  /**
   * Whether the browser supports HTML5 placeholder attributes
   * <input placeholder="Enter Text">
   */
  SUPPORTS_PLACEHOLDER: function() {
    return "placeholder" in document.createElement("input");
  },
  
  HAS_FLASH: (function() {
    var cache = {};
    return function(version) {
      if (typeof(cache[version]) === "undefined") {
        cache[version] = !!window.swfobject && swfobject.hasFlashPlayerVersion(version + "");
      }
      return cache[version];
    };
  })(),
  
  IS_ANDROID_WEBKIT: function() {
    var userAgent = navigator.userAgent.toLowerCase();
    return userAgent.indexOf("android") !== -1 && userAgent.indexOf("webkit") !== -1;
  },
  
  IS_SAFARI: function() {
    return $.browser.safari && !navigator.userAgent.match(/chrome/i);
  }
};