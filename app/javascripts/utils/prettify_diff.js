protonet.utils.prettifyDiff = (function() {
  var LINE_TEMPLATE = '<li style="background:{color};">{line}</li>',
      GREEN = "#DDFFDD",
      RED = "#FFDDDD",
      BLUE = "#EAF2F5";
  
  return function(str) {
    return "<ol class='linenums'>" + $.map(str.split("\n"), function(line) {
      if (line.startsWith("+")) {
        return LINE_TEMPLATE.replace("{line}", line).replace("{color}", GREEN);
      }
      
      if (line.startsWith("-")) {
        return LINE_TEMPLATE.replace("{line}", line).replace("{color}", RED);
      }
      
      if (line.startsWith("@@ ")) {
        return LINE_TEMPLATE.replace("{line}", line).replace("{color}", BLUE);
      }
      
      return "<li>" + line + "</li>";
    }).join("") + "</ol>";
  };
})();