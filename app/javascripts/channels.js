$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  $("#channels ul li").click(function(event){
    $("#channels-details").load("/channels/" + event.currentTarget.id.match(/channel-(.*)/)[1]);
    $("#channels ul li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
  });
  if(location.hash) {
    $("#channel-" + location.hash.substring(1)).click();
  } else {
    $("#channels li:first").click();
  }
});