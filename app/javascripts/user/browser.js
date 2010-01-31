protonet.user.Browser = {
  SUPPORTS_HTML5_MULTIPLE_FILE_UPLOAD: function() {
    var supportsMultipleAttribute = "multiple" in $('<input type="file" />')[0],
        supportsXhrUpload = "upload" in new XMLHttpRequest();
    
    // Firefox 3.6 goes fucking insane when uploading files since files are transferred through ram
    return supportsXhrUpload && supportsMultipleAttribute && !$.browser.mozilla;
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
  
  
  SUPPORTS_HTML5_DRAG_AND_DROP: function() {
    var testElement = $("<div />")[0];
    return "ondragenter" in testElement;
  },
  
  IS_ON_WINDOWS: function() {
    return navigator.userAgent.indexOf("Windows") != -1;
  },
  
  IS_ON_UBUNTU: function() {
    return navigator.userAgent.indexOf("Ubuntu") != -1;
  }
};