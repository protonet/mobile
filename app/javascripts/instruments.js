//= require "dispatcher/dispatcher.js"
//= require "timeline/timeline.js"
//= require "text_extensions/text_extensions.js"
//= require "effects/clouds.js"
//= require "controls/file_widget.js"
//= require "controls/user_widget.js"
//= require "controls/pretty_date.js"
//= require "controls/fluid.js"

//---------------------------- INITIALIZE INSTRUMENTS ----------------------------
$(function() {
  protonet.dispatcher.initialize();
  protonet.timeline.initialize();
  
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

  // Initialize fluid if the app is running in a fluid container
  if (protonet.user.Browser.SUPPORTS_FLUID()) {
    new protonet.controls.Fluid();
  }
});