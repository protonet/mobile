//= require "preferences/users_general"
//= require "preferences/users_specific"

$(function() {
  var input = $("a[rel]");
  protonet.utils.toggleElement(input);
});

$(function() {
  
  $("#users-details").bind("general user", function(event){
    switch(event.type)
    {
    case 'general':
      new protonet.preferences.UsersGeneral();
      break;
    case 'user':
      new protonet.preferences.UsersSpecific();
      break;
    }
  });
  
  // add clickabilty to menus
  $("#users-page ul li").click(function(event){
    var userId = event.currentTarget.id && event.currentTarget.id.match(/user-(.*)/)[1];
    var userDetails = $("#users-details");
    if(userId == 'general-settings') {
      userDetails.load("/preferences/user_settings", function(){
        // now initiate controls
        userDetails.trigger('general');
      });
    } else {
      userDetails.load("/users/" + userId + "?no_redirect=true", function(){
        // now initiate controls
        userDetails.trigger('user')
      });
    }
    $("#users-page ul li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
    location.hash = userId;
  });
  
  // jump to selected
  if(location.hash) {
    $("#user-" + location.hash.substring(1)).click();
  } else {
    $("#users-page li:first").click();
  }
});