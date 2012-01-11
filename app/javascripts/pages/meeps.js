//= require "../ui/meep_scroller.js"

protonet.p("meeps", function($page) {
  var $container    = $page.find("output"),
      $headline     = $(".meeps-page h2"),
      $window       = $(window),
      isModalWindow = $(".modal-window").length > 0;
  
  function resizeContainer() {
    if (isModalWindow) {
      $container.css("height", "100%");
    } else {
      $container.css("height", $window.height() - $container.offset().top + "px");
    }
  }
  
  $window.resize(resizeContainer);
  resizeContainer();
  
  if (isModalWindow) {
    var $output = $(".modal-window > output").css("overflow", "visible");
    $page.on("modal_window.unload", function() {
      $output.css("overflow", "");
    });
  }
  
  new protonet.ui.MeepScroller($container, $headline).show($container.data("meep-scroller-for"));
});