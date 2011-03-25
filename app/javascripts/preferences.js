//= require "preferences/vpn"
//= require "preferences/node"

$(function() {
  // 
  
  $("#preferences-details").bind("vpn_settings node_settings", function(event){
    switch(event.type)
    {
    case 'vpn_settings':
      new protonet.preferences.Vpn();
      break;
    case 'node_settings':
      new protonet.preferences.Node();
      break;
    }
  })
  
  // add clickabilty to menus
  $("#preferences-page ul li").click(function(event){
    var preference = event.currentTarget.id;
    $("#preferences-details").load("/preferences/" + preference, function(){
      // now initiate controls
      $("#preferences-details").trigger(preference);
    })
    $("#preferences-page ul li.clicked").toggleClass("clicked");
    $(this).toggleClass("clicked");
    location.hash = preference;
  });
  
  // jump to selected
  if(location.hash) {
    $(location.hash).click();
  } else {
    $("#preferences-page li:first").click();
  }

});