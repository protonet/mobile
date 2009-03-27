function CommandBlob(args) {
  this.starts_at = args.starts_at;
  this.ends_at = args.ends_at;
  this.command_type = args.command_type;
  this.destination = args.destination;
  
  console.log('new command blob has been created');
}

CommandBlob.prototype = {
  "class": null,
  "foobar": function() {
    
  }
}

function InputConsole(args) {
  var self = this;
  this.input_console  = args.input_console;
  // this.output_console = args.output_console;
  this.console_mode = false;
  
  this.last_command_blob = null;
  this.last_position = null;
  this.linearity = false;
  
  // bind keydown handling for tab key catching
  this.input_console.keydown(function(event) {
    self.tabHandler(event);
  });
  
  // bind event handling on the input
  this.input_console.keyup(function(event) {
    self.eventHandler(event);
  });
  
  this.command_hash = {};
  
}

InputConsole.prototype = {
  // error checker
  "errorCheck": function(event) {
    if(this.console_mode)
    {
      // @person
      // allowed
      
      // @@audience
      // allowed
      
      // @person.command
      // allowed for commands ['direct', 'important', 'send_file', 'secure', 'dis']
      
      // @@audience.person.command
      // allowed for commands ['direct', 'important', 'send_file', 'secure', 'dis']
      
      // @@audience.command
      // allowed for commands ['important']
      
      // @@audience.subaudience.subaudience...
      // allowed
      
      // @@audience.subaudience...person
      // allowed
      
      // @person.command.command.command
    }
  },
  
  "addCommand": function(command) {
    if(!command.starts_at) {
      throw 'foo';
    }
    this.command_hash[command.starts_at] = command;
  },
  
  "eventHandler": function(event) {
    // handle event preparation
    // optimizable: move it into a function only called when one of the triggers has happened
    var currentTarget   = event.currentTarget;
    var selectionEndsAt = event.currentTarget.selectionEnd;
    var selectionIndex  = selectionEndsAt - 1;
    
    
    // retrieve the previous character
    if(selectionIndex == 0)
    {
      var previousCharacter= null;
      var currentCharacter = currentTarget.value.substr((selectionIndex), 1);
    }
    else
    {
      var previousCharacter= currentTarget.value.substr((selectionIndex - 1), 1);
      var currentCharacter = currentTarget.value.substr((selectionIndex), 1);
      // this.linearity = this.last_position && (this.last_position + 1 == selectionEndsAt);
    }
        
    // console.log(event.which, this.last_position, this.linearity);
    // console.log("prev", previousCharacter, 'current', currentCharacter);
    // console.log(selectionIndex, selectionEndsAt);
    
    // this.last_position = selectionEndsAt;
    
    switch(event.which) {
      // case @
      // probably start of command sequence
      case 50:
        // check wether the previous character is a space
        // if yes this is the beginning of a command sequence
        if(previousCharacter == ' ' || !previousCharacter)
        {
          console.log('entering console mode');
          console.log('person mode')
          this.console_mode = 'person';
          var command = new CommandBlob({'starts_at': selectionIndex, 'command_type': this.console_mode});
          this.last_command_blob = command;
        }
        // check wether the previous character is a @
        // if yes the user is now trying to talk to a channel rather
        // than an end user
        else if(currentCharacter == '@' && this.console_mode == 'person')
        {
          console.log('audience mode');
          this.console_mode = 'audience';
          this.last_command_blob.command_type = this.console_mode;
        }
        // kinda error handling
        else
        {
          console.log('an error might have occured!');
        }
        
        // this.output_console.text(this.input_console);
        break;
      // case 
      
      // case dot
      // trying to call a method on x/y
      case 190:
        
        console.log('trying to call a method on a(n) ' + this.console_mode);
        break;
      
      // case space
      // end of command sequence
      case 32:
        var currentTarget   = event.currentTarget;
        var selectionEndsAt = event.currentTarget.selectionEnd;
        var selectionIndex  = selectionEndsAt - 1;
        
        if(this.console_mode) 
        {
          if(this.last_command_blob) {
            this.last_command_blob.ends_at = selectionIndex;
            this.last_command_blob.destination = currentTarget.value.substring(this.last_command_blob.starts_at,this.last_command_blob.ends_at);
            console.log('closing command: ', this.last_command_blob);
            this.last_command_blob = null;
          }
          this.console_mode = false;
          console.log('leaving console mode');
        }
        else
        {
          // do nothing
        }
        break;
        
      
        
      case 'foobar':
        break;
    }
    // output.text(input_console.attr('value'));
  },
  
  "tabHandler": function(event) {
    switch(event.which) {
      case 9:
        console.log('requesting help');
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        event.cancelBubble = true
        // debugger;
        break;
    }
    
  },
  
  "prepareDataForHandler": function(event) {
    //test
  }
  
}    
