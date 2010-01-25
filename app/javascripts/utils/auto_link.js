protonet.utils.autoLink = (function() {
  var REG_EXP = /(https?:\/\/[-\w\.]+:?\/[\w\/_\.-]*(\?\S+)?)/gi, // old /(\S+\.{1}[^\s\,\.\!]+)/g
      MAX_DISPLAY_LENGTH = 40;
  
  return function(str) {
    return str.replace(REG_EXP, function(url) {
      if (!url.isUrl()) {
        return url;
      }
      
      var realUrl = url,
          displayUrl = url.truncate(MAX_DISPLAY_LENGTH);
      
      // Add http prefix if necessary
      if (realUrl.startsWith("www.")) {
        realUrl = "http://" + realUrl;
      }
      
      return '<a href="' + realUrl + '" target="_blank" rel="nofollow">' + displayUrl + '</a>';
    });
  };
})();