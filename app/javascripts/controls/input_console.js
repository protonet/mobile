//= require "inline_autocompleter.js"


protonet.controls.InputConsole = function(args) {
  this.input_console      = args.input_console;
  this.form               = args.form;
  this.parent_widget      = args.parent_widget;
  this.writing            = false;
  this.autoCompleter      = new protonet.controls.InlineAutocompleter(this.input_console, [], {
    maxChars: 2
  });
  
  this.initEvents();
};


protonet.controls.InputConsole.prototype = {
  "initAutocompleter": function(entries, options) {
    entries = $.map(entries, function(entry) {
      return "@" + entry;
    });
    this.autoCompleter.addData(entries, options);
  },
  
  "bindAutocompleterToUserAddedEvents": function() {
    protonet.Notifications.bind("user.added", function(e, msg){
      this.autoCompleter.addData(["@" + msg.user_name]);
    }.bind(this));
  },
  
  "initEvents": function() {
    // focus input after channel switch
    protonet.Notifications.bind("channel.changed", function() {
      this.input_console.focus();
    }.bind(this));
    
    protonet.Notifications.bind("channel.initialized", function(event, channels) {
      this.initAutocompleter(channels);
    }.bind(this));
    
    // bind keydown handling for special key catching
    this.input_console.keydown(this.keyDown.bind(this));
    
    // bind submit
    this.form.submit(this.tweet.bind(this));
  },
  
  "keyDown": function(event) {
    this.sendWriteNotification();
    
    // Catch enter/return key
    if (event.which == 13) {
      
      // Allow creating of line break when shift key is pressed
      if (event.shiftKey) {
        return;
      }
      
      // Disable sending of empty messages
      if (!this.input_console.val()) {
        event.preventDefault();
        return;
      }
      
      this.tweet(event);
    }
  },
  
  "tweet": function(event) {
    console.log("sending via js");
    this.parent_widget.sendTweetFromInput();

    clearTimeout(this.writeTimeout);
    this.writing = false;
    this.recheck = false;

    this.sendStoppedWritingNotification();
    
    event.stopPropagation();
    event.preventDefault();
  },
  
  "sendWriteNotification": function() {
    var caretPosition = this.input_console.attr("selectionEnd");
    if (caretPosition == 0) {
      return false;
    }
    
    if (!this.writing || this.recheck) {
      this.recheck = false;
      if (!this.writing) {
        this.sendStartedWritingNotification();
        this.writing = true;
      }
      
      clearTimeout(this.writeTimeout);
      this.writeTimeout = setTimeout(function(){
        if (caretPosition == this.caretPosition) {
          this.sendStoppedWritingNotification();
          // console.log("stopped writing");
          this.writing = false;
        }
      }.bind(this), 3000);
      
      setTimeout(function(){
        // console.log('setting recheck');
        this.recheck = true;
      }.bind(this), 500);
      
      this.caretPosition = caretPosition;
    }
  },
  
  "sendStoppedWritingNotification": function() {
    json_request = {"operation": "user.stopped_writing", "payload": {"user_id": protonet.config.user_id}};
    protonet.globals.dispatcher.sendMessage(JSON.stringify(json_request));
  },
  
  "sendStartedWritingNotification": function() {
    json_request = {"operation": "user.writing", "payload": {"user_id": protonet.config.user_id}};
    protonet.globals.dispatcher.sendMessage(JSON.stringify(json_request));
  }
};
