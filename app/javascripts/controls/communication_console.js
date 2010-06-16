//= require "tweet.js"
//= require "input_console.js"
//= require "channel_selector.js"
//= require "browser_title.js"
//= require "../utils/is_window_focused.js"
//= require "../user/browser.js"

protonet.controls.CommunicationConsole = function() {
  // elements
  this.input = $("#message");
  this.form = $("#message-form");
  this.input_channel_id = $("#message_channel_id");
  
  // add sub views
  protonet.globals.inputConsole = new protonet.controls.InputConsole({
    "input_console": this.input,
    "parent_widget": this,
    "form": this.form
  });
  
  protonet.globals.textExtensionInput = new protonet.text_extensions.Input(this.input);
  
  // make it a global user object
  this.user_config      = protonet.config;
  this.current_user_id  = protonet.config.user_id;
  
  // active informations
  this.active_feed_id = 1; // home
  this.feeds = protonet.config.feed_ids || {};
  
  this.highlightReplies();
};

protonet.controls.CommunicationConsole.prototype = {
  observe: function() {
    protonet.Notifications
      .bind("messages.new", this.highlightReplies.bind(this))
      .bind("notification.new", this._notification.bind(this));
  },
  
  // this is just a proof of concept
  // and needs to be cleaned up
  highlightReplies: function() {
    $("p:not(.highlighted) > .reply").each(function(i, e){
      $(e).parent().addClass("highlighted");
    });
  },

  sendTweetFromInput: function() {
    if (!this.input.val()) {
      return;
    }
    
    var message = {
      message:        this.input.val(),
      text_extension: protonet.globals.textExtensionInput.getData()
    };
    
    this.sendMessage(message);
    
    this.input.val("");
  },
  
  sendMessage: function(message) {
    // render and send
    new protonet.controls.Tweet({
      form: this.form,
      message: message.message,
      text_extension: message.text_extension,
      author: this.user_config.user_name,
      channel_id: this.input_channel_id.val(),
      user_icon_url: this.user_config.user_icon_url
    }).send();
    
    protonet.Notifications.trigger("message.send", message);
  },
  
  receiveMessage: function(message) {
    console.log("cc is receiving message");
    
    message.text_extension = message.text_extension && JSON.parse(message.text_extension);
    new protonet.controls.Tweet(message);
    
    this._notification(null, message.channel_id, message);
    
    protonet.Notifications.trigger("message.receive", message);
  },
  
  _notification: function(e, channelId, message) {
    var currentChannelId = protonet.globals.channelSelector.getCurrentChannelId();
    channelId = channelId || currentChannelId;
    var isCurrentChannel = channelId == currentChannelId;
    var isAllowedToPlaySound = protonet.user.Config.get("sound");
    // Send general notification
    protonet.Notifications.trigger("message.new", [message, channelId]);
    
    if (!protonet.utils.isWindowFocused() && isCurrentChannel) {
      // Show fancy animated text in browser title
      protonet.controls.BrowserTitle.set("+++ New messages", true, true);
      
      // Play sound (some browsers don't support mp3 but ogg)
      if (isAllowedToPlaySound) {
        if (protonet.user.Browser.SUPPORTS_HTML5_AUDIO_OGG()) {
          new Audio("/sounds/notification.ogg").play();
        } else if (protonet.user.Browser.SUPPORTS_HTML5_AUDIO_MP3()) {
          new Audio("/sounds/notification.mp3").play();
        }
      }
    }
  }
};