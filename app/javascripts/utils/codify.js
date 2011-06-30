//= require "../lib/google_code_prettify.js"

/**
 * Enables code highlighting as know from Textile and BBCode
 *
 * @example
 *    protonet.utils.codify("[code]echo 'hello';[/code]");
 *    protonet.utils.codify("{code}echo 'hello';{code}");
 */
protonet.utils.codify = (function() {
  var REG_EXP = /([\{\[]code[\}\]])([\s\S]+)([\{\[]\/?code[\}\]])/g;
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      return "<pre>" + prettyPrintOne($.trim($2)) + "</pre>";
    });
  };
})();