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
  
  
  protonet.one("modal_window.rendered", function() {
    $(".modal-window > output").css("overflow", "visible");
    setTimeout(function() {
      protonet.one("modal_window.rendered", function() {
        $(".modal-window > output").css("overflow", "");
      });
    }, 0);
  });
  
  new protonet.ui.MeepScroller($container, $headline).show($container.data("meep-scroller-for"));
});