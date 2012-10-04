/**
 * Enables code highlighting as know from Textile and BBCode
 *
 * @example
 *    protonet.utils.codify("[code]echo 'hello';[/code]");
 *    protonet.utils.codify("{code}echo 'hello';{code}");
 */
protonet.utils.codify = (function() {
  var REG_EXP = /\s*([\{\[]code[\}\]])([\s\S]+?)([\{\[]\/?code[\}\]])\s*/gi;
  
  function trimEmptyLines(str) {
    return str.replace(/^\s*?\n+/g, "").replace(/\s+$/g, "");
  }
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      $2 = trimEmptyLines($2);
      return "<pre>" + $2  /* protonet.utils.prettifyCode($2, true) */ + "</pre>";
    });
  };
})();