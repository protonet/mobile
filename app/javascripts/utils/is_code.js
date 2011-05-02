/**
 * Determine whether a given string is code
 */
protonet.utils.isCode = (function() {
  var regExps = [
    // if (foo)
    /(if|for|while|switch|unless)\s*\([\s\S]+\)/i,
    /try\s*\{[\S\s]+?\}\s*catch\s*\(.+\)/i
    // function()
    /\bfunction\s*\([\s\S]*\)/i,
    // function foo()
    /\bfunction\s+.+?\s*\([\s\S]*?\)/i,
    // var foo = 
    /\bvar\s+[$\w]+\s*\=/i,
    // })()
    /\}\)\(\)/i,
    // }()
    /\}\(\)/,
    // $(foo)
    /$\(.+?\)/,
    // return true OR return false
    /return\s+(true|false)/i,
    // ruby/rails
    /\bdef\s+\S+?\n\S+?\send/,
    // foo[:bar]
    /\S+\[\:\S+?\]/,
    // "#{foobar}"
    /\"\S*#\{.+?\}\S*\"/,
    // class ApplicationContrller
    /class\s+\w+?Controller/,
    // class LdapGroup  < ActiveLdap::Base
    /class\s+\w+\s+\<\s+\w/,
    /(lambda|do)\s*\{\s*\|\w+\|/,
    // module ApplicationHelper
    /module\s+\w+?Helper/,
    // Array: [1, 2, 3]
    /\[[\S\s]+?,[\S\s]+?\]/,
    // JSON { foo: "bar" }
    /\{\s*(\"|\')?[-$\w\s]+?(\"|\')?\:[\S\s]+\}/,
    // variable assignment
    /\w+\s*(\+|\-|\|\|)?\=\s*\w/,
    // conditions
    /.+?(\=\=\=|\=\=|\!\=\=|\!\=|\>|\<|\>\=|\<\=).+/,
    // ruby hashes {:foo => 1}
    /\{\s*(\"|\'|\:)[-$\w\s]+?(\"|\')?\=\>:[\S\s]+\}/,
    /\<\?php\s/,
    /\<\%(\=|\-|\s)/,
    // php var assignment
    /\$\w+\s*\=\S/,
    /\<\?\=\s/,
    // html/xml
    /\<\w+\s+\w+\=\"?\S/,
    /\<\w+\/\>/
  ];
  
  return function(str) {
    for (var i=0, length=regExps.length; i<length; i++) {
      if (str.match(regExps[i])) {
        return true;
      }
    }
    return false;
  };
})();