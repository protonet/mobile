/**
 * Inline AutoCompletion
 * Marks text in input fields and textarea's while typing
 *
 * @param {Object} input jQuery reference to the input field you want to enable auto completion
 * @param {Array} data Data that should be auto completed
 * @param {Object} options Optional configurations (see _defaultOptions for more information)
 */
 
protonet.controls.InlineAutocompleter = function(input, data, options) {
  this.input = input;
  this.options = $.extend({}, this._defaultOptions, options);
  this.data = this._prepareData(data);
  
  this.autocompletionMode = false;
  this.currentSuggestions = [];
  
  this._observe();
};

protonet.controls.InlineAutocompleter.prototype = {
  _defaultOptions: {
    maxChars:       1,                                // which string length should be used for auto completion
    lowerCase:      true,                             // match in lower case mode
    prefix:         "",                               // only match when string starts with prefix
    append:         " ",                              // string to append after selecting,
    whiteSpace:     [" ", "\n", "\t", "[", "(", "{"], // array of strings to consider as white space (character before start of new word)
    matchingChars:  /[\w_\-\.]/i,                     // only execute completion look up when one of these chars has been pressed,
    fromBeginning:  true,                             // Whether it should also autocomplete when it's in the beginning of the input value
    onAutocomplete: $.noop
  },
  
  IGNORE_KEYS: [
    16, // SHIFT
    17, // CTRL
    18, // ALT
    91, // CMD
    38, // KEY UP
    40  // Guess what... KEY DOWN
  ],
  
  _prepareData: function(data) {
    return $.map(data, function(entry) {
      if (typeof(entry) != "string") {
        return null;
      }
      
      entry = $.trim(entry);
      if (!entry) {
        return null;
      }
      
      if (this.options.lowerCase) {
        entry = entry.toLowerCase();
      }
      
      if (this.options.prefix) {
        entry = this.options.prefix + entry;
      }
      
      return entry;
    }.bind(this));
  },
  
  _observe: function() {
    this.input.keyup(this._keyup.bind(this)).keydown(this._keydown.bind(this));
  },
  
  _getLastWhiteSpace: function(value) {
    var args = $.map(this.options.whiteSpace, function(str) {
      return value.lastIndexOf(str);
    });
    return Math.max.apply(Math, args);
  },
  
  _keyup: function(event) {
    /**
     * Completely ignore special characters like (shift, ctrl, ...)
     */
    if ($.inArray(event.which, this.IGNORE_KEYS) != -1) {
      return;
    }
    this.autocompletionMode = false;
    
    var enteredCharacter        = String.fromCharCode(event.which || event.keyCode),
        value                   = this.input.val(),
        caretPosition           = this.input.attr("selectionStart"),
        characterBeforeCaret    = value.substring(caretPosition - 1, caretPosition),
        valueUntilCaret         = value.substring(0, caretPosition),
        valueFromCaret          = value.substring(caretPosition),
        lastWhiteSpace          = this._getLastWhiteSpace(valueUntilCaret),
        currentlyTypedWordStart = lastWhiteSpace + 1,
        currentlyTypedWordEnd   = caretPosition,
        currentlyTypedWord      = valueUntilCaret.substring(currentlyTypedWordStart, currentlyTypedWordEnd);
    
    if (lastWhiteSpace === -1 && !this.options.fromBeginning) {
      return;
    }
    
    if (currentlyTypedWord.length < this.options.maxChars) {
      return;
    }
    
    if (!enteredCharacter.match(this.options.matchingChars)) {
      return;
    }
    
    this.currentSuggestions = this.getSuggestions(currentlyTypedWord);
    this.currentSuggestionIndex = 0;
    
    if (!this.currentSuggestions.length) {
      return;
    }
    
    this.autocompletionMode = true;
    
    /**
     * Check whether typed character is the same as the one in front of the caret
     * People who type really fast experience this bug
     * (also known as the "andreas.gehret bug")
     */
    if (enteredCharacter.toLowerCase() == characterBeforeCaret.toLowerCase()) {
      var currentSuggestion = this.currentSuggestions[this.currentSuggestionIndex];
          newValue          = value.substr(0, currentlyTypedWordStart)
            + currentlyTypedWord
            + this.currentSuggestions[this.currentSuggestionIndex]
            + value.substr(currentlyTypedWordEnd);
      
      this.input.val(newValue);
      this._markText(currentlyTypedWordEnd, currentlyTypedWordEnd + currentSuggestion.length);
    }
  },
  
  _keydown: function(event) {
    this.ignoreKeyUp = false;
    if (!this.autocompletionMode) {
      return;
    }
    switch(event.which) {
      case 40: // key down
        this.currentSuggestionIndex++;
        if (this.currentSuggestionIndex >= this.currentSuggestions.length) {
          this.currentSuggestionIndex = 0;
        }
        break;
      case 38: // key up
        this.currentSuggestionIndex--;
        if (this.currentSuggestionIndex < 0) {
          this.currentSuggestionIndex = this.currentSuggestions.length - 1;
        }
        break;
      case 9:  // tab
      case 39: // right arrow
        var value         = this.input.val(),
            selectionEnd  = this.input.attr("selectionEnd"),
            newValue      = value.substr(0, selectionEnd) + this.options.append + value.substr(selectionEnd);
        this.input.val(newValue)
          .attr("selectionEnd", selectionEnd + this.options.append.length)
          .attr("selectionStart", selectionEnd + this.options.append.length);
        event.preventDefault();
        this.options.onAutocomplete();
      default:
        return;
    }
    
    this._replaceMarkedTextWith(this.currentSuggestions[this.currentSuggestionIndex]);
    this.ignoreKeyUp = true;
    event.preventDefault();
  },
  
  _markText: function(from, to) {
    this.input.attr("selectionStart", from).attr("selectionEnd", to).focus();
  },
  
  _replaceMarkedTextWith: function(str) {
    var selectionStart = this.input.attr("selectionStart"),
        selectionEnd   = this.input.attr("selectionEnd"),
        value          = this.input.val(),
        newValue       = value.substr(0, selectionStart) + str + value.substr(selectionEnd);
    
    this.input.val(newValue);
    this._markText(selectionStart, selectionStart + str.length);
  },
  
  //-------------------- PUBLIC -------------------\\
  addData: function(dataToAdd, hasPriority) {
    dataToAdd = this._prepareData($.makeArray(dataToAdd));
    if (hasPriority) {
      this.data = dataToAdd.concat(this.data);
    } else {
      this.data = this.data.concat(dataToAdd);
    }
  },
  
  getSuggestions: function(str) {
    str = this.options.lowerCase ? str.toLowerCase() : str;
    
    if (this.options.prefix && !str.startsWith(this.options.prefix)) {
      return [];
    }
    
    var strLength   = str.length,
        suggestions = [],
        i           = 0,
        dataLength  = this.data.length,
        potentialSuggestion;
        
    for (i=0; i<dataLength; i++) {
      potentialSuggestion = this.data[i];
      if (potentialSuggestion.startsWith(str) && str != potentialSuggestion) {
        suggestions.push(potentialSuggestion.substr(strLength));
      }
    }
    return suggestions;
  }
};