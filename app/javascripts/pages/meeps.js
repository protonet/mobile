//= require "../ui/meep_scroller.js"

$(function() {
  var $page         = $(".meeps-page"),
      $container    = $page.find("output"),
      $headline     = $(".modal-window h1, .meeps-page h1"),
      isModalWindow = $(".modal-window").length > 0;
  
  function resizeContainer() {
    $container.css("height", $(window).height() - $container.offset().top + "px");
  }
  
  if (!isModalWindow) {
    $(window).resize(resizeContainer);
    resizeContainer();
  }
  
  new protonet.ui.MeepScroller($container, $headline).show($container.data("meep-scroller-for"));
});