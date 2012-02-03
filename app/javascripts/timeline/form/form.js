//= require "../../utils/url_behaviors.js"

/**
 * @events
 *    form.submitted          - Indicates that the input has been submitted
 *    form.create_reply       - Pass the name to a user and it prefills the message textarea
 *    meep.send               - Causes a new meep to render and to post
 */
protonet.timeline.Form = {
  initialize: function() {
    this.form               = $("#message-form");
    this.wrapper            = $("#textarea-wrapper-inner");
    this.input              = $("#message");
    this.channelIdInput     = $("#meep_channel_id");
    this.socketIdInput      = $("#meep_socket_id");
    this.$window            = $(window);
    this.typing             = false;
    
    this._initExtensions();
    this._initTextExtension();
    
    this._observe();
    this._prefill();
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
    var preventInitialFocus = protonet.config.user_is_stranger;
    
    protonet
      .on("user.changed_avatar", function(user) {
        if (user.id == protonet.config.user_id) {
          this.form.find("[name='meep[avatar]']").val(user.avatar);
        }
      }.bind(this))
      
      .on("channel.hide", function() {
        protonet.trigger("form.disable");
      })
      
      /**
       * Focus input after channel switch
       * and update hidden channel id
       */
      .on("channel.change", function(channelId) {
        protonet.trigger("form.enable");
        
        // When loading the page a "channel.change" event is initially fired
        // This causes problems when the user already focused the login form and started to type
        // in his password. Uygar from XING even almost accidentally submitted her password
        if (!preventInitialFocus && !protonet.browser.IS_TOUCH_DEVICE()) {
          this.input.focus();
        }
        
        preventInitialFocus = false;
        this.channelIdInput.val(channelId);
      }.bind(this))
      
      /**
       * Update socket id
       */
     .on("socket.update_id", function(data) {
        this.socketIdInput.val(data.socket_id);
      }.bind(this))
    
      /**
       * Create replies on demand
       */
      .on("form.create_reply", function(userName) {
        var value = this.input.focus().val(),
            reply = "@" + userName + " ";
        if (value.indexOf(reply) === -1) { // Only insert "@username" when not already in input
          this.input.val(value + ((value.slice(-1) == " " || !value.length) ? "" : " ") + reply);
        }
      }.bind(this))
      
      /**
       * Submit form with custom message or textExtension
       */
      .on("form.custom_submit", function(message, textExtension) {
        if (message) {
          this.input.focus().val(message);
        }
        if (textExtension) {
          this.textExtension.setInput(JSON.stringify(textExtension));
        }
        this.form.submit();
      }.bind(this))
      
      .on("form.fill", function(message, mark) {
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
       * Focus the input
       */
      .on("form.focus", function() {
        this.input.focus();
      }.bind(this))
      
      /**
       * Insert text at the caret/cursor position
       */
      .on("form.insert", function(text) {
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
      
      .on("form.enable", function() {
        this.form.removeClass("disabled");
      }.bind(this))
      
      .on("form.disable", function() {
        this.form.addClass("disabled");
        this.input.blur();
      }.bind(this))
      
      /**
       * Update input value
       */
      .on("meep.error", function(element, data) {
        var value = this.input.focus().val();
        if (!$.trim(value)) {
          this.input.val(data.message);
        }
      }.bind(this))
      
      .on("form.share_meep", function(id) {
        protonet.data.Meep.get(id, function(data) {
          if (data.author !== protonet.config.user_name) {
            protonet.trigger("form.create_reply", data.author);
          } else {
            protonet.trigger("form.focus");
          }
          protonet.trigger("text_extension_input.select", protonet.data.Meep.getUrl(id));
        });
      });
    
    
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
    
    $.behaviors({
      "[data-reply-to]:click": function(element, event) {
        protonet
          .trigger("form.create_reply", $(element).data("reply-to"))
          .trigger("modal_window.hide");
        event.preventDefault();
      }
    });
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
      .trigger("meep.send",       this.form, true)
      .trigger("form.submitted",  this.form);
    
    this.input.val("");
  },
  
  _typingStart: function() {
    if (!this.typing) {
      this.typing = true;
      protonet.trigger("socket.send", {
        operation: "user.typing",
        payload: { 
          user_id:      protonet.config.user_id,
          channel_id:   protonet.timeline.Channels.selected,
          channel_uuid: protonet.data.Channel.getUuidById(protonet.timeline.Channels.selected)
        }
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
        payload: { user_id: protonet.config.user_id }
      });
    }
  },
  
  _prefill: function() {
    protonet.utils.urlBehaviors({
      "form.fill":                    /(?:\?|&)message=([^&#$]+)(.*)/,
      "text_extension_input.select":  /(?:\?|&)url=([^&#$]+)(.*)/,
      "form.share_meep":              /(?:\?|&)share=([^&#$]+)(.*)/,
      "form.create_reply":            /(?:\?|&)reply_to=([^&#$]+)(.*)/
    });
  }
};

//= require "extensions.js"