protonet.utils.prettifyNumber = (function() {
  var REG_EXP = /(\d+)(\d{3})/,
      DELIMITER = ",";
  return function(num) {
    num += "";
    
    while (REG_EXP.test(num)) {
      num = num.replace(REG_EXP, "$1" + DELIMITER + "$2");
    }
    
    return num;
  };
})();