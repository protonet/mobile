protonet.p = function(pageName, callback) {
  var $page     = $("section." + pageName + "-page"),
      $window   = $(window),
      $document = $(document);
  if ($page.length) {
    $(callback.bind($page, $page, $window, $document))
  }
};