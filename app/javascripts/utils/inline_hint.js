protonet.utils.InlineHint = (function() {
  var CLASS_NAME = "inline-hint";
  
  return function(input, hint) {
    var form = input.parents("form");
    
    var unset = function() {
      if (input.val() == hint) {
        input.val("").removeClass(CLASS_NAME);
      }
    };
    
    var set = function() {
      if (!input.val() || input.val() == hint) {
        input.val(hint).addClass(CLASS_NAME);
      }
    };
    
    if (form) {
      form.submit(unset);
    }
    
    input.blur(set).focus(unset);
    
    set();
  };
})();