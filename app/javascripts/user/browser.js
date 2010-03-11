protonet.user.Browser = {
  SUPPORTS_HTML5_MULTIPLE_FILE_UPLOAD: function() {
    var supportsMultipleAttribute = "multiple" in $('<input type="file" />')[0],
        supportsXhrUpload = "upload" in new XMLHttpRequest();
    
    return supportsXhrUpload && supportsMultipleAttribute;
  },
  
  SUPPORTS_FILE_READER: function() {
    return (/function|object/).test(typeof(window.FileReader)) && "readAsBinaryString" in new window.FileReader();
  },
  
  SUPPORTS_FLASH_UPLOAD: function() {
    var flash;
    
    if (window.ActiveXObject) {
      for (var i=8, flashVersions=20; i<flashVersions; i++) {
        try {
          flash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
          if (flash) { return true; }
        } catch(e) {}
      }
    }
    
    if (navigator.plugins) {
      flash = navigator.plugins["Shockwave Flash"];
      if (flash) {
        var flashVersion = parseInt(flash.description.split("Shockwave Flash ")[1], 10);
        if (flashVersion >= 10) { return true; }
      }
    }
    
    return false;
  },
  
  IS_ON_WINDOWS: function() {
    return navigator.userAgent.indexOf("Windows") != -1;
  },
  
  IS_ON_LINUX: function() {
    return navigator.userAgent.indexOf("Linux") != -1;
  },
  
  SUPPORTS_HTML5_AUDIO: function() {
    return (/function|object/).test(typeof(window.Audio)) && "canPlayType" in new window.Audio();
  },
  
  SUPPORTS_HTML5_AUDIO_MP3: function() {
    if (!this.SUPPORTS_HTML5_AUDIO()) {
      return false;
    }
    
    var canPlayMp3 = new window.Audio().canPlayType("audio/mpeg");
    return canPlayMp3 != "no" && canPlayMp3 != "";
  },
  
  SUPPORTS_HTML5_AUDIO_OGG: function() {
    if (!this.SUPPORTS_HTML5_AUDIO()) {
      return false;
    }
    
    var canPlayOgg = new window.Audio().canPlayType("audio/ogg");
    return canPlayOgg != "no" && canPlayOgg != "";
  },
  
  HAS_FILE_UPLOAD_ENCODING_ISSUES: function() {
    return navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1;
  }
};