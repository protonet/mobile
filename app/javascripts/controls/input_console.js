protonet.controls.CommandBlob = function(args) {
  this.starts_at    = args.starts_at;
  this.ends_at      = args.ends_at;
  this.command_type = args.command_type;
  this.destination  = args.destination;
  
  console.log("new command blob has been created");
};


protonet.controls.InputConsole = function(args) {
  this.input_console      = args.input_console;
  this.form               = args.form;
  this.parent_widget      = args.parent_widget;
  this.console_mode       = null;
  this.last_command_blob  = null;
  this.previousValue      = "";
  this.command_hash       = {};
  this.writing            = false;
  
  this.initEvents();
};

protonet.controls.InputConsole.prototype = {
  "initEvents": function() {
    // bind keydown handling for special key catching
    this.input_console.keydown(this.specialKeyHandler.bind(this));
    
    // bind event handling on the input
    this.input_console.keyup(this.eventHandler.bind(this));
    
    // bind submit
    this.form.submit(this.tweet.bind(this));
  },
  
  "errorCheck": function() {
    if (this.console_mode) {
      // @person
      // allowed
      
      // @@channel
      // allowed
      
      // @person.command
      // allowed for commands ['direct', 'important', 'send_file', 'secure', 'dis']
      
      // @@channel.person.command
      // allowed for commands ['direct', 'important', 'send_file', 'secure', 'dis']
      
      // @@channel.command
      // allowed for commands ['important']
      
      // @@channel.subchannel.subchannel...
      // allowed
      
      // @@channel.subchannel...person
      // allowed
      
      // @person.command.command.command
    }
  },
  
  "addCommand": function(command) {
    if(!command.starts_at) {
      throw "foo"; // <--- WTF!?
    }
    this.command_hash[command.starts_at] = command;
  },
  
  "eventHandler": function(event) {
    // handle event preparation
    // optimizable: move it into a function only called when one of the triggers has happened
    var selectionEndsAt   = this.input_console.attr("selectionEnd");
    var selectionIndex    = selectionEndsAt - 1;
    var currentValue      = this.input_console.val();
    var inputHasChanged   = currentValue !== this.previousValue;
    var deletedCharacters = currentValue.length < this.previousValue.length;
    var previousCharacter, currentCharacter;
    
    // check if input value has changed
    if (!inputHasChanged) { return; }
    
    // store current value
    this.previousValue = currentValue;
    
    // retrieve the previous character
    if (selectionIndex === 0) {
      currentCharacter  = currentValue.substr(selectionIndex, 1);
    } else {
      previousCharacter = currentValue.substr(selectionIndex - 1, 1);
      currentCharacter  = currentValue.substr(selectionIndex, 1);
    }
    
    this.sendWriteNotification(selectionIndex);
    
    // console.log("prev", previousCharacter, 'current', currentCharacter);
    // console.log(selectionIndex, selectionEndsAt);
    
    switch (currentCharacter) {
      // probably start of command sequence
      case "@":
        // check wether the previous character is a space
        // if yes this is the beginning of a command sequence
        if (jQuery.trim(previousCharacter) === "") {
          
          console.log("person mode");
          this.console_mode = "person";
          
          var command = new protonet.controls.CommandBlob({
            starts_at: selectionIndex,
            command_type: this.console_mode
          });
          this.last_command_blob = command;
          
        }
        // check wether the previous character is a @
        // if yes the user is now trying to talk to a channel rather
        // than an end user
        else if (previousCharacter === "@" && this.console_mode === "person") {
          
          console.log("channel mode");
          this.console_mode = "channel";
          this.last_command_blob.command_type = this.console_mode;
          
        }
        break;
      
      // trying to call a method on x/y
      case ".":
        if (this.console_mode) {
          console.log("trying to call a method on a(n) " + this.console_mode);
        }
        break;
      
      // end of command sequence
      case " ":
        if (this.console_mode)  {
          if (this.last_command_blob) {
            this.last_command_blob.ends_at = selectionIndex;
            this.last_command_blob.destination = currentValue.substring(this.last_command_blob.starts_at, this.last_command_blob.ends_at);
            console.log("closing command: ", this.last_command_blob);
            
            this.last_command_blob = null;
          }
          this.console_mode = null;
          console.log("leaving console mode");
        }
        break;
    }
  },
  
  "specialKeyHandler": function(event) {
    switch(event.which) {
      // Tab
      case 9:
        console.log("requesting help");
        event.stopPropagation();
        event.preventDefault();
        break;
        
      // Return/Enter key
      case 13:
        if (event.shiftKey) {
          break;
        }
        if (!this.input_console.val()) {
          event.preventDefault();
          break;
        }
        
        this.tweet(event);
        break;
    }
    
  },
  
  "tweet": function(event) {
    console.log("sending via js");
    this.parent_widget.sendTweetFromInput();

    this.sendStoppedWritingNotification();

    event.stopPropagation();
    event.preventDefault();
  },
  
  "sendWriteNotification": function(last_index) {
    if(!this.writing || this.recheck) {
      this.recheck = false;
      if(!this.writing) {
        this.sendStartedWritingNotification();
        // console.log("writing");
        this.writing = true;
      }
      setTimeout(function(){
        if(last_index == this.last_index) {
          this.sendStoppedWritingNotification();
          // console.log("stopped writing");
          this.writing = false;
        }
      }.bind(this), 4000);
      setTimeout(function(){
        // console.log('setting recheck');
        this.recheck = true;
      }.bind(this), 500);
      this.last_index = last_index;
    }
  },
  
  "sendStoppedWritingNotification": function() {
    json_request = {"operation": "user.stopped_writing", "payload": {"user_id": protonet.config.user_id}};
    window.Dispatcher.sendMessage(JSON.stringify(json_request));
  },
  
  "sendStartedWritingNotification": function() {
    json_request = {"operation": "user.writing", "payload": {"user_id": protonet.config.user_id}};
    window.Dispatcher.sendMessage(JSON.stringify(json_request));
  }
};
