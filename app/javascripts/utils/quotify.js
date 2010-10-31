/**
 * Allows to quote text
 *
 * @example
 *    protonet.utils.quotify("[quote]echo 'hello';[/quote]");
 *    protonet.utils.quotify("{quote}echo 'hello';{quote}");
 */
protonet.utils.quotify = (function() {
  var REG_EXP = /([\{\[]quote[\}\]])((.|\n)+?)([\{\[]\/?quote[\}\]])/g;
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      return "<q>" + $.trim($2) + "</q>";
    });
  };
})();