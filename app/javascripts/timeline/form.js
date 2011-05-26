//= require "../controls/inline_autocompleter.js"
//= require "../utils/smilify.js"


/**
 * @events
 *    form.submitted          - Indicates that the input has been submitted
 *    form.create_reply       - Pass the name to a user and it prefills the message textarea
 *    meep.send               - Causes a new meep to render and to post
 */
protonet.timeline.Form = {
  initialize: function() {
    this.form               = $("#message-form");
    this.input              = this.form.find("#message");
    this.channelIdInput     = this.form.find("#tweet_channel_id");
    this.socketIdInput      = this.form.find("#tweet_socket_id");
    this.textExtensionInput = this.form.find("#text-extension-input");
    this.$window            = $(window);
    this.typing             = false;
    
    this._initAutocompleter();
    this._initTextExtension();
    
    this._observe();
  },
  
  _initAutocompleter: function() {
    // @reply autocompleter
    this.autoCompleter = new protonet.controls.InlineAutocompleter(this.input, [], {
      maxChars: 2,
      prefix:   "@"
    });
    
    // Markup autocompleter
    var markupRegExp   = /((\{|\[)[a-z]+(\}|\]))\s*$/i,
        onAutocomplete = function() {
          var value           = this.input.val(),
              selectionEnd    = this.input.attr("selectionEnd"),
              beforeCaret     = value.substring(0, selectionEnd),
              match           = beforeCaret.match(markupRegExp) || [],
              openingTag      = match[1];
          if (openingTag) {
            var closingTag   = match[2] + "/" + openingTag.substring(1); // "{code}" becomes "{/code}"
            this.input
              .val(value.substring(0, selectionEnd) + closingTag + value.substring(selectionEnd))
              .attr("selectionStart", selectionEnd)
              .attr("selectionEnd", selectionEnd);
          }
        }.bind(this);
    
    new protonet.controls.InlineAutocompleter(this.input, [
      "quote}", "/quote}", "code}", "/code}"
    ], {
      append:     "",
      whiteSpace: ["{"],
      onAutocomplete: onAutocomplete
    });
    
    new protonet.controls.InlineAutocompleter(this.input, [
      "code]", "/code]", "quote]", "/quote]"
    ], {
      append:     "",
      whiteSpace: ["["],
      onAutocomplete: onAutocomplete
    });
  },
  
  _initTextExtension: function() {
    new protonet.text_extensions.Input(this.input);
  },
  
  _observe: function() {
    /**
     * Add users to Autocompleter when loaded
     */
    protonet.Notifications.bind("users.data_available", function(e, userData) {
      var userNames = [];
      $.each(userData, function(key, value) { userNames.push(value.name); });
      userNames = userNames.sort(function(a, b) { return a.length - b.length > 0 ? 1 : -1; });
      this.autoCompleter.addData(userNames, true);
    }.bind(this));
    
    /**
     * Add channel names to autocompleter when initialized
     */
    protonet.Notifications.bind("channels.data_available", function(e, channelData, availableChannels) {
      var availableChannelNames = [];
      $.each(availableChannels, function(key, value) { availableChannelNames.push(key); });
      this.autoCompleter.addData(availableChannelNames);
    }.bind(this));
    
    /**
     * Add newly registered user to auto completer
     */
    protonet.Notifications.bind("user.added", function(e, user){
      this.autoCompleter.addData(user.name, true);
    }.bind(this));
    
    /**
     * Focus input after channel switch
     * and update hidden channel id
     */
    var preventFocus = protonet.user.data.is_stranger;
    protonet.Notifications.bind("channel.change", function(e, channelId) {
      // When loading the page a "channel.change" event is initially fired
      // This causes problems when the user already focused the login form and started to type
      // in his password. Uygar from XING even almost accidentally submitted her password
      if (!preventFocus) {
        this.input.focus();
      }
      
      preventFocus = false;
      this.channelIdInput.val(channelId);
    }.bind(this));
    
    /**
     * Update socket id
     */
    protonet.Notifications.bind("socket.update_id", function(e, data) {
      this.socketIdInput.val(data.socket_id);
    }.bind(this));
    
    /**
     * Create replies on demand
     */
    protonet.Notifications.bind("form.create_reply", function(e, userName) {
      var value = this.input.focus().val(),
          reply = "@" + userName + " ";
      this.input.val(value + ((value.slice(-1) == " " || !value.length) ? "" : " ") + reply);
    }.bind(this));
    
    /**
     * Submit form with custom message or textExtension
     */
    protonet.Notifications.bind("form.custom_submit", function(e, message, textExtension) {
      if (message) {
        this.input.focus().val(message);
      }
      if (textExtension) {
        this.textExtensionInput.val(JSON.stringify(textExtension));
      }
      this.form.submit();
    }.bind(this));
    
    protonet.Notifications.bind("form.fill", function(e, message, mark) {
      var value = this.input.focus().val();
      // add a white space before message if neccessary
      message = ((value.slice(-1) == " " || !value.length) ? "" : " ") + message;
      this.input.val(value + message);
      this.input[0].selectionStart = value.length;
      this.input[0].selectionEnd = value.length + message.length;
      // Invoke text extension checker
      this.input.trigger("paste");
    }.bind(this));
    
    /**
     * Update input value
     */
    protonet.Notifications.bind("meep.error", function(e, element, data) {
      var value = this.input.focus().val();
      if (!$.trim(value)) {
        this.input.val(data.message);
      }
    }.bind(this));
    
    
    /**
     * Fire global event when form is submitted
     * or the user hits the enter key in the input
     * Please note it's still possible to create line breaks by
     * pressing the shiftKey while hitting the enter key.
     */
    this.form.submit(this.submit.bind(this));
    this.input.keypress(function(event) {
      if (!event.metaKey) {
        this._typingStart();
      }
      
      if (event.keyCode != 13 || event.shiftKey || event.altKey) {
        return;
      }
      
      this.submit(event);
    }.bind(this));
  },
  
  /**
   * Send meep when input is not blank by triggering a global
   * event notification
   */
  submit: function(event) {
    event && event.preventDefault();
    
    if ($.trim(this.input.val()) == "") {
      return;
    }
    
    this._typingEnd();
    
    protonet.Notifications.trigger("meep.send", [this.form, true]);
    protonet.Notifications.trigger("form.submitted", [this.form]);
    
    this.input.val("");
  },
  
  _typingStart: function() {
    if (!this.typing) {
      this.typing = true;
      protonet.Notifications.trigger("socket.send", {
        operation: "user.typing",
        payload: { user_id: protonet.user.data.id }
      });
    }
    
    clearTimeout(this._typingTimeout);
    this._typingTimeout = setTimeout(this._typingEnd.bind(this), 2500);
  },
  
  _typingEnd: function() {
    if (this.typing) {
      this.typing = false;
      clearTimeout(this._typingTimeout);
      protonet.Notifications.trigger("socket.send", {
        operation: "user.typing_end",
        payload: { user_id: protonet.user.data.id }
      });
    }
  }
};