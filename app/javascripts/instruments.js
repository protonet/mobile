//= require "timeline/timeline.js"
//= require "text_extensions/text_extensions.js"
//= require "effects/clouds.js"
//= require "dispatching/dispatching_system.js"
//= require "controls/file_widget.js"
//= require "controls/user_widget.js"
//= require "controls/pretty_date.js"
//= require "controls/fluid.js"
//= require "lib/jQuery.dPassword.js"

//---------------------------- INITIALIZE INSTRUMENTS ----------------------------
$(function() {
  protonet.user.initialize();
  protonet.timeline.initialize();
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
  // protonet.globals.clouds = new protonet.effects.Clouds($("#cloud-container"), {
  //   minStartPosition: -20,
  //   maxStartPosition: 90,
  //   minSize:          10,
  //   maxSize:          60,
  //   minSpeed:         1,
  //   maxSpeed:         1.5,
  //   amount:           15
  // });
});

// Initialize fluid if the app is running in a fluid container
$(function() {
  if (protonet.user.Browser.SUPPORTS_FLUID()) {
    new protonet.controls.Fluid();
  }
});