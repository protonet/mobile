protonet.utils.autoLink = (function() {
  /**
   * This is basically a rebuild of
   * the rails auto_link_urls text helper
   *
   * revision 1:
   *    /(\S+\.{1}[^\s\,\.\!]+)/g
   *
   * revision 2:
   *    /(\b(((https?|ftp):\/\/)|(www\.))[-A-Z0-9+&@#\/%?=~_|!:,.;\[\]]*[-A-Z0-9+&@#\/%=~_|])/gim
   */
  var URL_REG_EXP           = /(https?:\/\/|www\.)[^\s<]{3,}/gi,
      TRAILING_CHAR_REG_EXP = /([^\w\/-])$/i,
      MAX_DISPLAY_LENGTH    = 70,
      BRACKETS              = {
        ")": "(",
        "]": "[",
        "}": "{"
      };
  
  return function(str) {
    return str.replace(URL_REG_EXP, function(url) {
      var punctuation = (url.match(TRAILING_CHAR_REG_EXP) || [])[1] || "",
          opening     = BRACKETS[punctuation];
      
      url = url.replace(TRAILING_CHAR_REG_EXP, "");
      
      if (url.split(opening).length > url.split(punctuation).length) {
        url = url + punctuation;
        punctuation = "";
      }
      
      var realUrl    = url,
          displayUrl = url.truncate(MAX_DISPLAY_LENGTH);
      
      // Add http prefix if necessary
      if (realUrl.startsWith("www.")) {
        realUrl = "http://" + realUrl;
      }
      
      return '<a href="' + realUrl + '" target="_blank">' + displayUrl + '</a>' + punctuation;
    });
  };
})();