//= require "template.js"

/**
 * Replaces text emoji with images :-)
 *
 * @example
 *    protonet.utils.emojify("hey what's up, dudes! :fire:");
 *      => 'hey what's up, dudes! <img src="..." class="fire">'
 *    protonet.utils.emojify.shortcuts
 *      => list of all supported emojis
 *
 * See emoji.css for instructions on how to maintain the emojies
 */
protonet.utils.emojify = (function() {
  var REG_EXP_TEMPLATE = /:(\w+):/gi;
  var DEFINED_EMOJIS   = " laugh amazed wink cry cheek tongue grin sad kiss angry rofl struggled heart brokenheart plus1 minus1 fist wait iphone microphone music key sun moon turd camera telephone squid pig alien rocket crone light victory fire stop tv ghost devil scull money zzz flash shoe bath golf muscle traffic tennis baseball surfing soccer question exclamation flower ipod beers smoking pill lipstick fingernails massage rose star xmastree rice fries ring cake diamond church guitar mouth basketball football pool coffee snowman cloud tiger bear dog cow rabbit snake chicken boar mouse whale post monkey kissing pistol burger radio bike adultsonly nosmoking balloon bomb star bow santa rainbow ";
    
  function emojify(str, ignoreSetting) {
    if (!ignoreSetting && !protonet.user.Config.get("smilies")) {
      return str;
    }
    
    str = str.replace(REG_EXP_TEMPLATE, function(original, $1) {
      $1 = $1.toLowerCase();
      if (DEFINED_EMOJIS.indexOf(" " + $1 + " ") !== -1) {
        return new protonet.utils.Template("emoji-template", {
          type:     $1,
          shortcut: (":" + $1 + ":")
        });
      } else {
        return original;
      }
    });
    return str;
  };
  
  emojify.shortcuts = DEFINED_EMOJIS;
  
  return emojify;
})();