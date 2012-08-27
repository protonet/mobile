/**
 * Escapes single quote, double quotes and backslash characters in a string with backslashes
 *
 * @example
 *    protonet.utils.addSlashes("Georg's a retard");
 *      => "Georg\'s a retard"
 */
protonet.utils.addSlashes = (function() {
  var REG_EXP_CHARS = /[\\"']/g,
      REG_EXP_UNICODE = /\u0000/g;
  
  return function(str) {
    return str.replace(REG_EXP_CHARS, "\\$&").replace(REG_EXP_UNICODE, "\\0");
  };
})();