//= require "../timeline/timeline.js"
//= require "../widgets/file.js"
//= require "../widgets/user.js"
//= require "../platforms/fluid.js"
//= require "../platforms/prism.js"
//= require "../ui/click_to_flash_teaser.js"

//---------------------------- INITIALIZE INSTRUMENTS ----------------------------
$(function() {
  protonet.dispatcher.initialize();
  protonet.timeline.initialize();
  
  // Init widgets
  if (protonet.config.show_user_widget) {
    new protonet.widgets.User();
  }
  
  if (protonet.config.show_file_widget) {
    new protonet.widgets.File();
  }
  
  $("section.main-content").css("min-height", $("aside.side-content").outerHeight().px());
  
  // there's a captive portal redirect request and the user is logged in
  if (!!protonet.config.captive_redirect_url && !protonet.config.user_is_stranger) {
    var ov = new protonet.ui.Overlay("you've been captive portalled! " + protonet.config.captive_redirect_url);
    setTimeout((5).seconds(), ov.hide);
  }
});