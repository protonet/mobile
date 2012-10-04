/**
 * @example
 *    protonet.utils.textify("[text]hallo[/text]");
 *    protonet.utils.textify("{text}hallo{text}");
 */
protonet.utils.textify = (function() {
  var REG_EXP = /\s*([\{\[]text[\}\]])([\s\S]+?)([\{\[]\/?text[\}\]])\s*/gi;
  
  function trimEmptyLines(str) {
    return str.replace(/^\s*?\n+/g, "").replace(/\s+$/g, "");
  }
  
  return function(str) {
    return str.replace(REG_EXP, function(match, $1, $2) {
      $2 = trimEmptyLines($2);
      return "<pre class=\"wrap\">" + $2 + "</pre>";
    });
  };
})();