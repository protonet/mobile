//= require "dispatcher/dispatcher.js"
//= require "ui/modal_window.js"
//= require "window/meep.js"
//= require "window/search.js"
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
  protonet.window.Search.initialize();
  
  // Init widgets
  new protonet.controls.UserWidget();
  new protonet.controls.FileWidget();
  
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
});