//= require "../ui/meep_scroller.js"

protonet.p("meeps", function($page) {
  var $content      = $page.find(".content"),
      $headline     = $(".meeps-page h2"),
      isModalWindow = $(".modal-window").length > 0,
      data          = $content.data("meep-scroller-for"),
      cache         = protonet.data.Meep.getCache();
  
  cache[data.id] = data;
  
  function resizePage() {
    if (isModalWindow) {
      $content.css("height", "100%");
    } else {
      $content.css("height", $window.height() - $content.offset().top - 1 + "px");
    }
  }
  
  $window.on("resize", resizePage);
  resizePage();
  
  if (isModalWindow) {
    var $output = $(".modal-window > output"),
        oldOverflow = $output.css("overflow");
    $output.css("overflow", "visible");
    protonet.one("modal_window.unload", function() {
      $window.off("resize", resizePage);
      $output.css("overflow", oldOverflow);
    });
  }
  
  new protonet.ui.MeepScroller($content, $headline).show(data.id);
});