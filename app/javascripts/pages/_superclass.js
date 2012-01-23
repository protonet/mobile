protonet.p = function(pageName, callback) {
  var $page   = $("section." + pageName + "-page"),
      $window = $(window);
  if ($page.length) {
    $(callback.bind($page, $page, $window))
  }
};