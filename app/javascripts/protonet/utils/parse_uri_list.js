/**
 * Takes an uri list (text/uri-list)
 * and returns it's urls as array
 *
 * A uri list could look like this:
 *
 *    # Mozilla website
 *    http://www.mozilla.org
 *    # A second link
 *    http://www.xulplanet.com
 *
 */
protonet.utils.parseUriList = (function() {
  var REG_EXP_COMMENT = /^#.*/; // gm = General Motors, bwahaha ...
  return function(str) {
    var lines = str.split("\n");
    
    lines = $.map(lines, function(line) {
      line = $.trim(line);
      if (!line || line === "about:blank" || line.match(REG_EXP_COMMENT)) {
        return null;
      } else {
        return line;
      }
    });
    
    return lines;
  };
})();