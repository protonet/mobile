//= require "../lib/google_code_prettify.js"
//= require "prettify_diff.js"

protonet.utils.prettifyCode = function(str) {
  var isDiff = str.startsWith("@@ ") || str.startsWith("diff --");
  if (isDiff) {
    return protonet.utils.prettifyDiff(str);
  } else {
    return prettyPrintOne(str);
  }
};