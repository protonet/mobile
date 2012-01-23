//= require "../ui/meep_scroller.js"

protonet.p("meeps", function($page, $window) {
  var $content      = $page.find(".content"),
      $headline     = $(".meeps-page h2"),
      isModalWindow = $(".modal-window").length > 0;
  
  function resizeContainer() {
    if (isModalWindow) {
      $content.css("height", "100%");
    } else {
      $content.css("height", $window.height() - $content.offset().top + "px");
    }
  }
  
  $window.on("resize", resizePage);
  resizePage();
  
  if (isModalWindow) {
    var $output = $(".modal-window > output").css("overflow", "visible");
    $page.on("modal_window.unload", function() {
      $window.off("resize", resizePage);
      $output.css("overflow", "");
    });
  }
  
  new protonet.ui.MeepScroller($content, $headline).show($content.data("meep-scroller-for"));
});