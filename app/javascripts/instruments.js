//= require "dispatcher/dispatcher.js"
//= require "ui/modal_window.js"
//= require "pages/search.js"
//= require "pages/meep.js"
//= require "timeline/timeline.js"
//= require "text_extensions/text_extensions.js"
//= require "effects/clouds.js"
//= require "controls/file_widget.js"
//= require "controls/user_widget.js"
//= require "controls/pretty_date.js"
//= require "platforms/fluid.js"
//= require "platforms/prism.js"
//= require "ui/click_to_flash_teaser.js"

//---------------------------- INITIALIZE INSTRUMENTS ----------------------------
$(function() {
  protonet.dispatcher.initialize();
  protonet.timeline.initialize();
  
  if (protonet.config.allow_modal_views) {
    new protonet.pages.Search();
    new protonet.pages.Meep();
    new protonet.Page("users");
  }
  
  // Init widgets
  if (protonet.config.show_user_widget) {
    new protonet.controls.UserWidget();
  }
  
  if (protonet.config.show_file_widget) {
    new protonet.controls.FileWidget();
  }
  
  if (protonet.config.show_clouds) {
    // Frickin' stunning cloud graphics (makes your squirrel run in circles!!)
    setTimeout(function() {
      new protonet.effects.Clouds($("#cloud-container"), {
        minStartPosition: -10,
        maxStartPosition: 90,
        minSize:          10,
        maxSize:          50,
        amount:           25,
        animated:         false
      });
    }, 100);
  }
});