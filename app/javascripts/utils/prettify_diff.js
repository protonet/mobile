protonet.utils.prettifyDiff = (function() {
  var LINE_TEMPLATE = '<div style="background:{color};">{line}</div>',
      GREEN = "#DDFFDD",
      RED = "#FFDDDD",
      BLUE = "#EAF2F5";
  
  return function(str) {
    return $.map(str.split("\n"), function(line) {
      if (line.startsWith("+")) {
        return LINE_TEMPLATE.replace("{line}", line).replace("{color}", GREEN);
      }
      
      if (line.startsWith("-")) {
        return LINE_TEMPLATE.replace("{line}", line).replace("{color}", RED);
      }
      
      if (line.startsWith("@@ ")) {
        return LINE_TEMPLATE.replace("{line}", line).replace("{color}", BLUE);
      }
      
      return line + "<br />";
    }).join("");
  };
})();