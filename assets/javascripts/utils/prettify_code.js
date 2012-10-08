protonet.utils.prettifyCode = function(str, lineNumbers) {
  var isDiff = str.startsWith("@@ ") || str.startsWith("diff -") || str.startsWith("Binary files ");
  if (isDiff) {
    return protonet.utils.prettifyDiff(str);
  } else {
    return prettyPrintOne(str, undefined, lineNumbers);
  }
};