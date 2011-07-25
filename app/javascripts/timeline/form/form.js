/**
 * @events
 *    form.submitted          - Indicates that the input has been submitted
 *    form.create_reply       - Pass the name to a user and it prefills the message textarea
 *    meep.send               - Causes a new meep to render and to post
 */
protonet.timeline.Form = {
  initialize: function() {
    this.form               = $("#message-form");
    this.wrapper            = this.form.find("#textarea-wrapper-inner");
    this.input              = this.form.find("#message");
    this.channelIdInput     = this.form.find("#meep_channel_id");
    this.socketIdInput      = this.form.find("#meep_socket_id");
    this.$window            = $(window);
    this.typing             = false;
    
    this._initExtensions();
    this._initTextExtension();
    
    this._observe();
  },
  
  _initExtensions: function() {
    if (this.extensions) {
      $.each(this.extensions, function(i, extension) {
        new extension(this.input, this.wrapper, this.form);
      }.bind(this));
    }
  },
  
  _initTextExtension: function() {
    this.textExtension = new protonet.text_extensions.Input(this.input);
  },
  
  _observe: function() {
    var preventFocus = protonet.user.data.is_stranger;
    
    protonet
      /**
       * Focus input after channel switch
       * and update hidden channel id
       */
      .bind("channel.change", function(e, channelId) {
        // When loading the page a "channel.change" event is initially fired
        // This causes problems when the user already focused the login form and started to type
        // in his password. Uygar from XING even almost accidentally submitted her password
        if (!preventFocus) {
          this.input.focus();
        }
      
        preventFocus = false;
        this.channelIdInput.val(channelId);
      }.bind(this))
    
      /**
       * Update socket id
       */
     .bind("socket.update_id", function(e, data) {
        this.socketIdInput.val(data.socket_id);
      }.bind(this))
    
      /**
       * Create replies on demand
       */
      .bind("form.create_reply", function(e, userName) {
        var value = this.input.focus().val(),
            reply = "@" + userName + " ";
        this.input.val(value + ((value.slice(-1) == " " || !value.length) ? "" : " ") + reply);
      }.bind(this))
      
      /**
       * Submit form with custom message or textExtension
       */
      .bind("form.custom_submit", function(e, message, textExtension) {
        if (message) {
          this.input.focus().val(message);
        }
        if (textExtension) {
          this.textExtension.setInput(JSON.stringify(textExtension));
        }
        this.form.submit();
      }.bind(this))
      
      .bind("form.fill", function(e, message, mark) {
        var value = this.input.focus().val();
        // add a white space before message if neccessary
        message = ((!value || value.slice(-1) == " ") ? "" : " ") + message;
        this.input.val(value + message);
        if (mark) {
          this.input[0].selectionStart = value.length;
          this.input[0].selectionEnd = value.length + message.length;
        }
        // Invoke text extension checker
        this.input.trigger("paste");
      }.bind(this))
      
      /**
       * Insert text at the caret/cursor position
       */
      .bind("form.insert", function(e, text) {

        var value         = this.input.focus().val(),
            inputElement  = this.input[0],
            // TODO: This doesn't work as expected in IE8 + 9!
            // selectionEnd is always 0
            selectionEnd  = inputElement.selectionEnd,
            beforeCaret   = value.substr(0, selectionEnd),
            afterCaret    = value.substr(selectionEnd);
        
        if (beforeCaret && !beforeCaret.slice(-1).match(/\s/)) {
          beforeCaret += " ";
        }
        
        if (!afterCaret || !afterCaret.slice(1).match(/\s/)) {
          text += " ";
        }
        
        this.input.val(beforeCaret + text + afterCaret);
        inputElement.selectionStart = inputElement.selectionEnd = beforeCaret.length + text.length;
      }.bind(this))
      
      /**
       * Update input value
       */
      .bind("meep.error", function(e, element, data) {
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
    
    if (!$.trim(this.input.val()) && !this.textExtension.getData()) {
      return;
    }
    
    this._typingEnd();
    
    protonet
      .trigger("meep.send",       [this.form, true])
      .trigger("form.submitted",  [this.form]);
    
    this.input.val("");
  },
  
  _typingStart: function() {
    if (!this.typing) {
      this.typing = true;
      protonet.trigger("socket.send", {
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
      protonet.trigger("socket.send", {
        operation: "user.typing_end",
        payload: { user_id: protonet.user.data.id }
      });
    }
  }
};

//= require "extensions.js"