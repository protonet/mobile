//= require "../controls/inline_autocompleter.js"
//= require "../utils/smilify.js"
//= require "../lib/webcam.js"


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
    this._initSnapshot();
    
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
              selectionEnd    = this.input.prop("selectionEnd"),
              beforeCaret     = value.substring(0, selectionEnd),
              match           = beforeCaret.match(markupRegExp) || [],
              openingTag      = match[1];
          if (openingTag) {
            var closingTag   = match[2] + "/" + openingTag.substring(1); // "{code}" becomes "{/code}"
            this.input
              .val(value.substring(0, selectionEnd) + closingTag + value.substring(selectionEnd))
              .prop("selectionStart", selectionEnd)
              .prop("selectionEnd", selectionEnd);
          }
        }.bind(this);
    
    new protonet.controls.InlineAutocompleter(this.input, [
      "quote}", "/quote}", "code}", "/code}"
    ], {
      fromBeginning: false,
      append:     "",
      whiteSpace: ["{"],
      onAutocomplete: onAutocomplete
    });
    
    new protonet.controls.InlineAutocompleter(this.input, [
      "code]", "/code]", "quote]", "/quote]"
    ], {
      fromBeginning: false,
      append:     "",
      whiteSpace: ["["],
      onAutocomplete: onAutocomplete
    });
    
    // emoji autocompleter
    var emojis = [];
    protonet.utils.emojify.shortcuts.replace(/\w+/g, function(match) {
      emojis.push(":" + match + ":");
    });
    
    new protonet.controls.InlineAutocompleter(this.input, emojis);
  },
  
  _initTextExtension: function() {
    this.textExtensionInput = new protonet.text_extensions.Input(this.input);
  },
  
  _initSnapshot: function() {
    if (!window.webcam) {
      return;
    }
    
    var modalWindow, that = this;
    this.form.delegate("a.take-snapshot", "click", function() {
      webcam.set_swf_url("/flash/webcam.swf");
      webcam.set_shutter_sound(true, "/sounds/shutter.mp3");
      webcam.set_api_url();
      webcam.set_hook("onComplete", function(response) { alert(response); });
      modalWindow = modalWindow || new protonet.ui.ModalWindow("snapshot-page");
      
      var container = $("<div>"),
          lineBreak = $("<br>"),
          button    = $("<button>", {
            text: "Snap!",
            click: function() {
              button.attr("disabled", "disabled");
              webcam.snap(protonet.config.node_base_url + "/snapshooter", function(photoUrl) {
                that.textExtensionInput.select(protonet.config.base_url + photoUrl);
                modalWindow.hide();
              });
            }
          });
      
      container.append(webcam.get_html(400, 300, 800, 600)).append(lineBreak).append(button);
      modalWindow.headline($(this).text()).content(container).show();
    });
  },
  
  _observe: function() {
    var userNames = [], channelNames = [];
    
    /**
     * Add users to Autocompleter when loaded
     */
    protonet.bind("users.data_available", function(e, users) {
      $.each(users, function(key, value) { userNames.push(value.name); });
      this.autoCompleter.setData(userNames.concat(channelNames));
    }.bind(this));
    
    /**
     * Add channel names to autocompleter when initialized
     */
    protonet.bind("channels.data_available", function(e, channelData, channels) {
      $.each(channels, function(key, value) { channelNames.push(key); });
      this.autoCompleter.setData(userNames.concat(channelNames));
    }.bind(this));
    
    protonet.bind("users.update_status", function(e, data) {
      // sort users by online status
      var onlineUsers = data.online_users || {}, id, user, index;
      for (id in onlineUsers) {
        user  = onlineUsers[id];
        index = userNames.indexOf(user.name);
        if (index !== -1) {
          userNames.splice(index, 1);
        }
        userNames.unshift(user.name);
      }
      this.autoCompleter.setData(userNames.concat(channelNames));
    }.bind(this));
    
    /**
     * Add newly registered user to auto completer
     */
    protonet.bind("user.added", function(e, user) {
      this.autoCompleter.addData(user.name, true);
    }.bind(this));
    
    /**
     * Focus input after channel switch
     * and update hidden channel id
     */
    var preventFocus = protonet.user.data.is_stranger;
    protonet.bind("channel.change", function(e, channelId) {
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
    protonet.bind("socket.update_id", function(e, data) {
      this.socketIdInput.val(data.socket_id);
    }.bind(this));
    
    /**
     * Create replies on demand
     */
    protonet.bind("form.create_reply", function(e, userName) {
      var value = this.input.focus().val(),
          reply = "@" + userName + " ";
      this.input.val(value + ((value.slice(-1) == " " || !value.length) ? "" : " ") + reply);
    }.bind(this));
    
    /**
     * Submit form with custom message or textExtension
     */
    protonet.bind("form.custom_submit", function(e, message, textExtension) {
      if (message) {
        this.input.focus().val(message);
      }
      if (textExtension) {
        this.textExtensionInput.val(JSON.stringify(textExtension));
      }
      this.form.submit();
    }.bind(this));
    
    protonet.bind("form.fill", function(e, message, mark) {
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
    protonet.bind("meep.error", function(e, element, data) {
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
    
    if ($.trim(this.input.val()) == "" && $.trim(this.textExtensionInput.val()) == "") {
      return;
    }
    
    this._typingEnd();
    
    protonet.trigger("meep.send", [this.form, true]);
    protonet.trigger("form.submitted", [this.form]);
    
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