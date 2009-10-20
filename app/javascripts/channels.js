$("a").click(function() {
  var item = $(this).attr("rel");

  if ($("#" + item).is(':hidden')) {
    $(".channel-edit").slideUp("medium");
    $("#" + item).slideDown("medium");
  }
});