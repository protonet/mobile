protonet.p = function(pageName, callback) {
  var $page = $("section." + pageName + "-page");
  if ($page.length) {
    $(callback.bind($page, $page))
  }
};