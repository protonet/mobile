//= require "user/config.js"
//= require "user/browser.js"
//= require "effects/clouds.js"
//= require "notifications/notifications.js"
//= require "dispatching/dispatching_system.js"
//= require "controls/communication_console.js"
//= require "controls/text_extension.js"
//= require "controls/file_widget.js"
//= require "controls/endless_scroller.js"
//= require "controls/user_widget.js"
//= require "controls/pretty_date.js"
//= require "controls/fluid.js"

//---------------------------- INITIALIZE INSTRUMENTS ----------------------------

// Initialize configuration stuff
$(function() {
  protonet.user.Config.initialize();
});


// Initialize communication stuff
$(function() {
  protonet.globals.notifications        = $(new protonet.notifications.Central());
  protonet.globals.communicationConsole = new protonet.controls.CommunicationConsole();
  protonet.globals.dispatcher           = new protonet.dispatching.DispatchingSystem();
});

// Initialize text extensions
$(function() {
  protonet.controls.TextExtension.initialize();
});


// Initialize file stuff
$(function() {
  // protonet.globals.fileWidget = new protonet.controls.FileWidget();
});


// Initialize endless scrolling
$(function() {
  protonet.globals.endlessScroller = new protonet.controls.EndlessScroller();
});

// Initialize user widget
$(function() {
  // protonet.globals.userWidget = new protonet.controls.UserWidget();
});


// Initialize pretty dates ("2 minutes ago")
$(function() {
  protonet.controls.PrettyDate.initialize();
  setInterval(function() {
    protonet.controls.PrettyDate.update();
  }, 30000);
});

// Frickin' stunning cloud animation (makes your squirrel run in circles!!)
$(function() {
  protonet.globals.clouds = new protonet.effects.Clouds($("#cloud-container"), {
    minStartPosition: -20,
    maxStartPosition: 90,
    minSize:          10,
    maxSize:          60,
    minSpeed:         1,
    maxSpeed:         1.5,
    amount:           15
  });
});

// Initialize fluid if the app is running in a fluid container
$(function() {
  if (protonet.user.Browser.SUPPORTS_FLUID()) {
    new protonet.controls.Fluid();
  }
});