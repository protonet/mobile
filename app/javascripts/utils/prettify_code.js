//= require "../lib/google_code_prettify.js"
//= require "prettify_diff.js"

protonet.utils.prettifyCode = function(str, lineNumbers) {
  var isDiff = str.startsWith("@@ ") || str.startsWith("diff -") || str.startsWith("Binary files ");
  if (isDiff) {
    return protonet.utils.prettifyDiff(str);
  } else {
    return prettyPrintOne(str, undefined, lineNumbers);
  }
};