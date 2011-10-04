//= require "dispatcher/dispatcher.js"
//= require "../timeline/timeline.js"
//= require "../widgets/file.js"
//= require "../widgets/user.js"
//= require "../widgets/search.js"
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
  
  if (protonet.config.show_search_widget) {
    new protonet.widgets.Search();
  }
  
  $("section.main-content").css("min-height", $("aside.side-content").outerHeight().px());
});