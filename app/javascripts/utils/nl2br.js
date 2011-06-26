// Converts line breaks \n to <br>
protonet.utils.nl2br = function(str) {
  return str.replace(/\n/g, "<br>");
};