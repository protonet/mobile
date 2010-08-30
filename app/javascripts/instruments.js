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
  
  new protonet.controls.UserWidget();
});


// Initialize communication stuff
$(function() {
  // protonet.globals.communicationConsole = new protonet.controls.CommunicationConsole();
  // protonet.globals.dispatcher           = new protonet.dispatching.DispatchingSystem();
  
});

// Initialize file stuff
$(function() {
  // protonet.globals.fileWidget = new protonet.controls.FileWidget();
});

// Initialize user widget
$(function() {
  // protonet.globals.userWidget = new protonet.controls.UserWidget();
});

// Frickin' stunning cloud animation (makes your squirrel run in circles!!)
$(function() {
  new protonet.effects.Clouds($("#cloud-container"), {
    minStartPosition: -20,
    maxStartPosition: 90,
    minSize:          10,
    maxSize:          50,
    amount:           20,
    animated:         false
  });
});

// Initialize fluid if the app is running in a fluid container
// $(function() {
//   if (protonet.user.Browser.SUPPORTS_FLUID()) {
//     new protonet.controls.Fluid();
//   }
// });