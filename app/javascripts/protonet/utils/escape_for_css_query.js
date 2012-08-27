/**
 * Adds slashes in front of quotes
 *
 * @example
 *    $("[data-foo=' + protonet.utils.escapeForCssQuery(attrContent) + ']");
 */
protonet.utils.escapeForCssQuery = (function() {
  var REG_EXP = /['"]/g;
  
  return function(str) {
    return str.replace(REG_EXP, "\\$&");
  };
})();