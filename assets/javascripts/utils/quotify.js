/**
 * Allows to quote text
 *
 * @example
 *    protonet.utils.quotify("[quote]echo 'hello';[/quote]");
 *    protonet.utils.quotify("{quote}echo 'hello';{quote}");
 */
protonet.utils.quotify = (function() {
  var REG_EXP = /\s*([\{\[]quote[\}\]])([\s\S]+?)([\{\[]\/?quote[\}\]])\s*/gi;
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      return "<q>" + $.trim($2) + "</q>";
    });
  };
})();