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
  
  this._observe();
};

protonet.controls.InlineAutocompleter.prototype = {
  _defaultOptions: {
    maxChars: 1,    // which string length should be used for auto completion
    lowerCase: true // match in lower case mode
  },
  
  IGNORE_KEYS: [
    8,  // backspace
    9,  // tab
    13, // return
    39, // right arrow
    37, // left arrow
    46  // delete
  ],
  
  END_SELECTION_KEYS: [
    9,   // tab
    39   // right arrow
  ],
  
  _observe: function() {
    this.input
      .keyup(this._keyUp.bind(this))
      .keydown(this._keyDown.bind(this));
  },
  
  _keyUp: function(event) {
    this._autoCompletionMode = false;
    
    var pressedKey = event.which;
    var value = this.input.val();
    var caretPosition = this._getCaretPosition();
    var currentInputCharacter = value.substring(caretPosition - 1, caretPosition).toLowerCase();
    var currentEventCharacter = String.fromCharCode(pressedKey).toLowerCase();
    
    // Ok, let's check if the event character equals the last character in the input
    if (currentInputCharacter !== currentEventCharacter) {
      return;
    }
    
    if ($.inArray(pressedKey, this.IGNORE_KEYS) != -1) {
      return;
    }
    
    this._findCompletions();
  },
  
  _keyDown: function(event) {
    var pressedKey = event.which;
    if (!this._autoCompletionMode) {
      return;
    }
    
    if ($.inArray(pressedKey, this.END_SELECTION_KEYS) == -1) {
      return;
    }
    
    var selectionEnd = this.input.attr("selectionEnd");
    var newCaretPosition = selectionEnd + 1;
    
    this._insert(" ", selectionEnd);
    
    this._setCaretPosition(newCaretPosition);
    event.preventDefault();
  },
  
  _findCompletions: function() {
    var caretPosition = this._getCaretPosition();
    var value = this.input.val();
    var valueUntilCaret = value.substring(0, caretPosition);
    var valueFromCaret = value.substring(caretPosition);
    var lastWhiteSpace = Math.max(
      valueUntilCaret.lastIndexOf(" "),
      valueUntilCaret.lastIndexOf("\n"),
      // we also handle opening parenthesis and brackets as "white space"
      valueUntilCaret.lastIndexOf("("),
      valueUntilCaret.lastIndexOf("[")
    ) + 1;
    var prefix = valueUntilCaret.substring(lastWhiteSpace, caretPosition);
    prefix = this.options.lowerCase ? prefix.toLowerCase() : prefix;
    
    if (prefix.length < this.options.maxChars) {
      return;
    }
    
    var i = 0;
    var dataLength = this.data.length;
    var entry;
    
    for (i=0; i<dataLength; i++) {
      entry = this.data[i];
      if (!entry.startsWith(prefix)) {
        continue;
      }
      
      var completion = entry.substring(prefix.length);
      var isAlreadyCompleted = valueFromCaret.startsWith(completion);
      if (isAlreadyCompleted) {
        continue;
      }
      
      this._autoCompletionMode = true;
      this._insert(completion, caretPosition);
      break;
    }
  },
  
  _insert: function(str, position) {
    var oldValue = this.input.val();
    var newValue = oldValue.substring(0, position) + str + oldValue.substring(position);
    this.input.val(newValue);
    this._markText(position, position + str.length);
  },
  
  _markText: function(from, to) {
    this.input.attr("selectionStart", from).attr("selectionEnd", to).focus();
  },
  
  _getSelectedText: function() {
    return this.input.val().substring(this.input.attr("selectionStart"), this.input.attr("selectionEnd"));
  },
  
  _prepareData: function(data) {
    // trim entries, remove empty entries
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
      
      return entry;
    }.bind(this));
  },
  
  _getCaretPosition: function() {
    return this.input.attr("selectionStart");
  },
  
  _setCaretPosition: function(position) {
    this.input.attr("selectionStart", position).attr("selectionEnd", position).focus();
  },
  
  addData: function(data) {
    this.data = this.data.concat(this._prepareData(data));
  }
};