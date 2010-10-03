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
  var SMILIES = [
    { shortcuts: [":-D", ":D"], className: "laugh" },
    { shortcuts: [":-)", ":)"], className: "grin" },
    { shortcuts: [":-O", ":O", ":-o", ":o"], className: "amazed" },
    { shortcuts: [":-(", ":("], className: "sad" },
    { shortcuts: [":'-(", ":'(", ";("], className: "cry" },
    { shortcuts: [">:O", ">:-O", ":@", ">:-(", ">:("], className: "angry" },
    { shortcuts: [":-P", ":P"], className: "tongue" },
    { shortcuts: ["B-)", "B)", "8-)", "8)"], className: "glasses" },
    { shortcuts: [";-)", ";)"], className: "wink" },
    { shortcuts: [":-/", ":/"], className: "struggled" }
  ];
  
  var REG_EXP_TEMPLATE = "(^|[\\s(])({smilie})(?=$|[\\s!?.)])";
  
  $.each(SMILIES, function(i, smilie) {
    smilie.regExps = $.map(smilie.shortcuts, function(shortcut) {
      var regExpStr = REG_EXP_TEMPLATE.replace("{smilie}", protonet.utils.escapeForRegExp(shortcut));
      return new RegExp(regExpStr, "g");
    });
  });
  
  return function(str) {
    if (!protonet.user.Config.get("smilies")) {
      return str;
    }
    
    $.each(SMILIES, function(i, smilie) {
      $.each(smilie.regExps, function(i, regExp) {
        str = str.replace(regExp, function(original, $1, $2) {
          return $1 + new protonet.utils.Template("smilie-template", {
            type:     smilie.className,
            shortcut: $2
          });
        });
      });
    });
    return str;
  };
})();