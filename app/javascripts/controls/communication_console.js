//= require "tweet.js"
//= require "input_console.js"
//= require "channel_selector.js"
//= require "browser_title.js"

protonet.controls.CommunicationConsole = function(args) {
  // elements
  this.input = $("#message");
  this.form = $("#message-form");
  this.input_channel_id = $("#message_channel_id");
  
  // add sub views
  this.channel_selector = new protonet.controls.ChannelSelector({"parent_widget": this});
  this.input_console    = new protonet.controls.InputConsole({
    "input_console": this.input,
    "parent_widget": this,
    "form": this.form
  });
  
  this.text_extension_input = new protonet.controls.TextExtension.Input(this.input);
  
  // make it a global user object
  this.user_config      = args.config;
  this.current_user_id  = args.config.user_id;
  
  // active informations
  this.active_feed_id = 1; // home
  this.feeds = args.feed_ids || {};
};

protonet.controls.CommunicationConsole.prototype = {
  "sendTweetFromInput": function() {
    // render and send
    new protonet.controls.Tweet({
      "form": this.form,
      "message": this.input.val(),
      "text_extension": this.text_extension_input.getData(),
      "author": this.user_config.user_name,
      "channel_id": this.input_channel_id.val(),
      "user_icon_url": this.user_config.user_icon_url
    }).send();
    
    this.input.val("");
    
    this.text_extension_input.reset();
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
    
    try {
      message.text_extension = JSON.parse(message.text_extension);
    } catch(e) {}
    
    new protonet.controls.Tweet(message);
    
    protonet.controls.BrowserTitle.set("+++ New messages", true, true);
  }
};