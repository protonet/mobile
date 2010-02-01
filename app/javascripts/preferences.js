$(function() {
  $("#preferences ul li").click(function(event){
    $("#preferences-details").load("/preferences/" + event.currentTarget.id)
    $("#preferences ul li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
  });
  $("#profile").click();
});

/*function profileController() {
  $('foo').click
}*/