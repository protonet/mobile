//= require "../controls/inline_autocompleter.js"


/**
 * @events
 *    input.submitted - Indicates that the input has been submitted
 *    meep.render     - Causes a new meep to render and to post
 */
protonet.timeline.Input = {
  initialize: function() {
    this.form           = $("#message-form");
    this.input          = this.form.find("#message");
    this.channelIdInput = this.form.find("#tweet_channel_id");
    this.$window        = $(window);
    this.typing         = false;
    
    this._initAutocompleter();
    this._initTextExtension();
    
    this._observe();
  },
  
  _initAutocompleter: function() {
    this.autoCompleter = new protonet.controls.InlineAutocompleter(this.input, [], {
      maxChars: 2
    });
  },
  
  _initTextExtension: function() {
    new protonet.text_extensions.Input(this.input);
  },
  
  _observe: function() {
    /**
     * Add users to Autocompleter when loaded
     */
    protonet.Notifications.bind("users.initialized", function(e, userNames) {
      userNames = $.map(userNames, function(userName) {
        return "@" + userName;
      });
      this.autoCompleter.addData(userNames);
    }.bind(this));
    
    /**
     * Add channel names to autocompleter when initialized
     */
    protonet.Notifications.bind("channels.initialized", function(e, channels) {
      channelNames = $.map(channels, function(channel) {
        return "@" + channel.name;
      });
      this.autoCompleter.addData(channelNames);
    }.bind(this));
    
    /**
     * Add newly registered user to auto completer
     */
    protonet.Notifications.bind("user.added", function(e, obj){
      this.autoCompleter.addData(["@" + obj.user_name]);
    }.bind(this));
    
    /**
     * Focus input after channel switch
     */
    protonet.Notifications.bind("channel.changed", function(e, channelId) {
      // Avoid scrolling up when switching between channels
      this.focus();
      this.channelIdInput.val(channelId);
    }.bind(this));
    
    /**
     * Fire global event when form is submitted
     * or the user hits the enter key in the input
     * Please note it's still possible to create line breaks by
     * pressing the shiftKey while hitting the enter key.
     */
    this.form.submit(this.submit.bind(this));
    this.input.keydown(function() {
      if (event.keyCode != 13 || event.shiftKey) {
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
    
    if (this.input.val().trim() == "") {
      return;
    }
    
    protonet.Notifications.trigger("meep.render", [this.form, true]);
    protonet.Notifications.trigger("input.submitted", [this.form]);
    
    this.input.val("");
  },
  
  /**
   * Focusing the input field when scrolled the input
   * out of the viewport causes the page to be scrolled
   * to the input which is sometimes really annoying
   * We simply store the original scroll position and 
   * apply it after the input has been focused
   */
  focus: function() {
    var oldScrollTop = this.$window.scrollTop();
    this.input.focus();
    this.$window.scrollTop(oldScrollTop);
  }
};