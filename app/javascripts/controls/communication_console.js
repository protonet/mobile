//= require "tweet.js"
//= require "input_console.js"
//= require "channel_selector.js"
//= require "browser_title.js"
//= require "../utils/is_window_focused.js"
//= require "../user/browser.js"

protonet.controls.CommunicationConsole = function(args) {
  // elements
  this.input = $("#message");
  this.form = $("#message-form");
  this.input_channel_id = $("#message_channel_id");
  
  // add sub views
  protonet.globals.channelSelector = new protonet.controls.ChannelSelector({
    "parent_widget": this,
    "channel_input": this.input_channel_id
  });
  protonet.globals.inputConsole = new protonet.controls.InputConsole({
    "input_console": this.input,
    "parent_widget": this,
    "form": this.form
  });
  
  protonet.globals.textExtensionInput = new protonet.controls.TextExtension.Input(this.input);
  
  // make it a global user object
  this.user_config      = args.config;
  this.current_user_id  = args.config.user_id;
  
  // active informations
  this.active_feed_id = 1; // home
  this.feeds = args.feed_ids || {};
};

protonet.controls.CommunicationConsole.prototype = {
  "sendTweetFromInput": function() {
    if (!this.input.val()) {
      return;
    }
    
    // render and send
    new protonet.controls.Tweet({
      "form": this.form,
      "message": this.input.val(),
      "text_extension": protonet.globals.textExtensionInput.getData(),
      "author": this.user_config.user_name,
      "channel_id": this.input_channel_id.val(),
      "user_icon_url": this.user_config.user_icon_url
    }).send();
    
    this.input.val("");
    
    protonet.globals.textExtensionInput.submitted();
  },
  
  "sendTweetFromMessage": function(message) {
    // render and send
    new protonet.controls.Tweet({
      "form": this.form,
      "message": message,
      "author": this.user_config.user_name,
      "channel_id": this.input_channel_id.val(),
      "user_icon_url": this.user_config.user_icon_url
    }).send();
  },
  
  "receiveMessage": function(message) {
    console.log("cc is receiving message");
    
    var tweetIsSameChannel = this.input_channel_id.val() == message.channel_id;
    message.text_extension = message.text_extension && JSON.parse(message.text_extension);
    new protonet.controls.Tweet(message);
    
    // Notification stuff
    if (!protonet.utils.isWindowFocused() && tweetIsSameChannel) {
      protonet.controls.BrowserTitle.set("+++ New messages", true, true);
      if (protonet.user.Browser.SUPPORTS_HTML5_AUDIO_OGG()) {
        new Audio("/sounds/notification.ogg").play();
      } else if (protonet.user.Browser.SUPPORTS_HTML5_AUDIO_MP3()) {
        new Audio("/sounds/notification.mp3").play();
      }
    }
    
    if (!tweetIsSameChannel) {
      protonet.globals.channelSelector.notify(message.channel_id);
    }
  }
};