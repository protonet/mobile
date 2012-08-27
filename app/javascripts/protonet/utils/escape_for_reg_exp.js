/**
 * Takes a string and escapes all regular expression characters
 * Inspired by http://simonwillison.net/2006/Jan/20/escape/
 *
 * @example
 *    protonet.utils.escapeForRegExp("hello. what's up?");
 *    => "hello \. what's up\?"
 */
protonet.utils.escapeForRegExp = (function() {
  var chars = [
    "/", ".", "*", "+", "?", "|",
    "(", ")", "[", "]", "{", "}", "\\"
  ];
  
  var REG_EXP = new RegExp("(\\" + chars.join("|\\") + ")", "g");
  
  return function(str) {
    return str.replace(REG_EXP, "\\$1");
  };
})();