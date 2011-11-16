//= require "../ui/meep_scroller.js"

$(function() {
  var $page         = $(".meeps-page"),
      $container    = $page.find("output"),
      $headline     = $(".meeps-page h2"),
      isModalWindow = $(".modal-window").length > 0;
  
  function resizeContainer() {
    if (isModalWindow) {
      $container.css("height", "100%");
    } else {
      $container.css("height", $(window).height() - $container.offset().top + "px");
    }
  }
  
  $(window).resize(resizeContainer);
  resizeContainer();
  
  $(".modal-window > output").css("overflow", "visible");
  protonet.one("modal_window.loaded", function() {
    $(".modal-window > output").css("overflow", "");
  });
  
  new protonet.ui.MeepScroller($container, $headline).show($container.data("meep-scroller-for"));
});