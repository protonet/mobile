$(function() {
  $("#preferences ul li").click(function(event){
    $("#preferences-details").load("/preferences/" + event.currentTarget.id)
  });
});