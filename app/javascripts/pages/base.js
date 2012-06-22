protonet.p = function(pageName, callback) {
  var $page     = $("section." + pageName + "-page");
  if ($page.length) {
    // Timeout needed for bloody IE
    setTimeout(function() {
      $(callback.bind($page, $page));
    }, 10);
  }
};