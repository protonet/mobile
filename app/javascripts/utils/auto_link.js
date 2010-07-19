protonet.utils.autoLink = (function() {
  /**
   * version 1:
   *    /(\S+\.{1}[^\s\,\.\!]+)/g
   * version 2:
   *    /(\b(((https?|ftp):\/\/)|(www\.))[-A-Z0-9+&@#\/%?=~_|!:,.;\[\]]*[-A-Z0-9+&@#\/%=~_|])/gim
   */
  var URL_REG_EXP = /(https?:\/\/|www\.)[^\s<]+/gi,
      TRAILING_CHAR_REG_EXP = /([^\w\/-])$/i,
      MAX_DISPLAY_LENGTH = 55;
  
  return function(str) {
    return str.replace(URL_REG_EXP, function(url) {
      var trailingCharsMatch = url.match(TRAILING_CHAR_REG_EXP) || [];
      url = url.replace(TRAILING_CHAR_REG_EXP, "");
      
      var realUrl = url,
          displayUrl = url.truncate(MAX_DISPLAY_LENGTH);
      
      // Add http prefix if necessary
      if (realUrl.startsWith("www.")) {
        realUrl = "http://" + realUrl;
      }
      
      return '<a href="' + realUrl + '" target="_blank" rel="nofollow">' + displayUrl + '</a>' + (trailingCharsMatch[1] || "");
    });
  };
})();