//= require "preferences/users_general"

$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  $("#users-page ul li").click(function(event){
    var userId = event.currentTarget.id && event.currentTarget.id.match(/user-(.*)/)[1];
    if(userId == 'general-settings') {
      $("#users-details").load("/preferences/user_settings", function(){
        new protonet.preferences.UsersGeneral();
      });
    } else {
      $("#users-details").load("/users/" + userId);
    }
    $("#users-page ul li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
    location.hash = userId;
  });
  if(location.hash) {
    $("#user-" + location.hash.substring(1)).click();
  } else {
    $("#users-page li:first").click();
  }
});
