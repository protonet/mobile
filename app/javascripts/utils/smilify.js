//= require "escape_for_reg_exp.js"
//= require "template.js"


/**
 * Replaces text smilies with images :-)
 *
 * @example
 *    protonet.utils.smilify("hey what's up, dudes! :-)");
 *      => 'hey what's up, dudes! <img src="..." class="grin">'
 */
protonet.utils.smilify = (function() {
  /**
   * Map smilies to corresponding css classes
   */
  var SMILIE_MAPPING = {
    ":-)":  "grin",
    ":)" :  "grin",
    ":-(":  "sad",
    ":(" :  "sad",
    ":-D":  "lol",
    ":D" :  "lol",
    ";-)":  "blink",
    ";)" :  "blink"
  };
  
  var REG_EXP_TEMPLATE = "(^|[\\s(]){smilie}($|[\\s!?.)])";
  
  var COMPILED_REG_EXPS = {};
  for (var i in SMILIE_MAPPING) {
    var regExp = REG_EXP_TEMPLATE.replace("{smilie}", protonet.utils.escapeForRegExp(i));
    COMPILED_REG_EXPS[i] = new RegExp(regExp, "g");
  }
  
  return function(str) {
    for (var i in COMPILED_REG_EXPS) {
      str = str.replace(COMPILED_REG_EXPS[i], function(original, $1, $2) {
        return $1 + new protonet.utils.Template("smilie-template", {
          type:     SMILIE_MAPPING[i],
          original: i
        }) + $2;
      });
    }
    return str;
  };
})();