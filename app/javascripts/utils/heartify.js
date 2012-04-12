/**
 * Turns smilie hearts "<3" into a real css-styled unicode heart (\u2665)
 */
protonet.utils.heartify = (function() {
  var REG_EXP     = /(^|[\s(])&lt;3|\u2665|xxx(?=$|[\s!?.)])/g,
      HTML        = '<span class="heart">&hearts;</span>';
  return function(str, ignoreSetting) {
    if (!ignoreSetting && !protonet.user.Config.get("smilies")) {
      return str;
    }
    return str.replace(REG_EXP, "$1" + HTML);
  };
})();