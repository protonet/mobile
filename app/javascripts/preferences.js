//= require "preferences/vpn"
//= require "preferences/node"
//= require "preferences/privacy"

$(function() {
  // 
  
  $("#preferences-details").bind("vpn_settings node_settings privacy_settings", function(event){
    switch(event.type)
    {
    case 'vpn_settings':
      new protonet.preferences.Vpn();
      break;
    case 'node_settings':
      new protonet.preferences.Node();
      break;
    case 'privacy_settings':
      new protonet.preferences.Privacy();
      break;
    }
  })
  
  // add clickabilty to menus
  $("#preferences-page ul li").click(function(event){
    event.preventDefault();
    var element = $(event.currentTarget);
    var preference = element.attr("id");
    $("#preferences-details").load("/preferences/" + preference, function(){
      // now initiate controls
      $("#preferences-details").trigger(preference);
    })
    $("#preferences-page ul li.clicked").toggleClass("clicked");
    element.toggleClass("clicked");
    location.hash = preference;
  });
  
  // jump to selected
  if(location.hash) {
    $(location.hash).click();
  } else {
    $("#preferences-page li:first").click();
  }

});