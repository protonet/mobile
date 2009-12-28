protonet.utils.toggleElement = function(input) {
  input.click(function() {
    var item = $(this).attr("rel");

    $(".hidden").each(function() {
      if (item != $(this).attr("id")) {
        $(this).slideUp("medium");
      }
    });

    $("#" + item).slideToggle("medium");

    return false;
  });
};