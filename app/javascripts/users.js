$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  $("#users ul li").click(function(event){
    $("#users-details").load("/users/" + event.currentTarget.id.match(/user-(.*)/)[1]);
    $("#users ul li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
  });
  if(location.hash) {
    $("#user-" + location.hash.substring(1)).click();
  } else {
    $("#users li:first").click();
  }
});
