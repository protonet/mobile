protonet.utils.BrowserTitle = (function() {
  var restoredTitle,
      autoRestore,
      doc                         = document,
      originalTitle               = doc.title,
      prefix                      = "",
      VISIBLE_CHARACTERS_IN_TITLE = 200;
      
  $window.focus(_focus);
  
  function _digits(n) { 
    // this function returns the number of digits in of a Number
    return 1 + Math.floor(Math.log(n)/Math.log(10)); 
  }
  
  function setPrefix(str) {
    prefix = str;
    autoRestore = true;
    
    if (protonet.browser.IS_CHROME() || protonet.browser.IS_FF()) {
      _setFavicon();
    }else{
      _setTitle();
    }
  }
  
  function _setTitle(){
    doc.title = "(" + prefix + ") " + originalTitle;
  }
  
  function _setFavicon(){

    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      img = new Image();

    canvas.width = 16;
    canvas.height = 16;

    img.src = '/favicon.ico';
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = "#F00";

      switch(_digits(prefix)){
        case 1:
          ctx.fillRect(9, 7, 8, 9);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(prefix, 10, 15);
          break;
        case 2:
          ctx.fillRect(3, 7, 13, 9);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(prefix, 4, 15);
          break;
        default:
          ctx.fillRect(3, 7, 13, 9);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText("99", 4, 15);
      };

      var link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = canvas.toDataURL("image/x-icon");

      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }
  function restore() {
    prefix = "";
    if (protonet.browser.IS_CHROME() || protonet.browser.IS_FF()) {
      _clearFavicon();
    }else{
      _clearTitle();
    }
  }
  
  function _focus() {
    // Timeout is needed for Safari (who otherwise doesn't restore the title)
    setTimeout(function() {
      autoRestore && restore();
    }, 100);
  }
  
  function _clearTitle(){
    autoRestore = false;
    doc.title = originalTitle;
  }
  
  function _clearFavicon(){
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/favicon.ico';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  
  return {
    setPrefix: setPrefix,
    restore: restore
  };
})();