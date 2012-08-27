protonet.utils.prettifyFileSize = (function() {
  function padded(num) {
    if (num > 10) {
      return Math.round(num);
    }
    return Math.round(num * 10) / 10;
  }
  
  return function(bytes) {
    var kiloBytes = bytes / 1024;
    if (kiloBytes < 1) {
      return padded(bytes) + " Bytes";
    }
    
    var megaBytes = kiloBytes / 1024;
    if (megaBytes < 1) {
      return padded(kiloBytes) + " KB";
    }
    
    var gigaBytes = megaBytes / 1024;
    if (gigaBytes < 1) {
      return padded(megaBytes) + " MB";
    }
    
    return padded(gigaBytes) + " GB";
  };
})();
