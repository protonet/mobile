//= require "../controls/inline_autocompleter.js"


/**
 * @events
 *    form.submitted          - Indicates that the input has been submitted
 *    meep.render_from_form   - Causes a new meep to render and to post
 */
protonet.timeline.Form = {
  initialize: function() {
    this.form           = $("#message-form");
    this.input          = this.form.find("#message");
    this.channelIdInput = this.form.find("#tweet_channel_id");
    this.socketIdInput  = this.form.find("#tweet_socket_id");
    this.$window        = $(window);
    this.typing         = false;
    
    this._initAutocompleter();
    this._initTextExtension();
    
    this._observe();
  },
  
  _initAutocompleter: function() {
    this.autoCompleter = new protonet.controls.InlineAutocompleter(this.input, [], {
      maxChars: 2,
      prefix:   "@"
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
      this.autoCompleter.addData(user.user_name, true);
    }.bind(this));
    
    /**
     * Focus input after channel switch
     * and update hidden channel id
     */
    protonet.Notifications.bind("channel.change", function(e, channelId) {
      this.input.focus();
      this.channelIdInput.val(channelId);
    }.bind(this));
    
    /**
     * Update socket id
     */
    protonet.Notifications.bind("socket.update_id", function(e, data) {
      this.socketIdInput.val(data.socket_id);
    }.bind(this));
    
    /**
     * Fire global event when form is submitted
     * or the user hits the enter key in the input
     * Please note it's still possible to create line breaks by
     * pressing the shiftKey while hitting the enter key.
     */
    this.form.submit(this.submit.bind(this));
    this.input.keydown(function(event) {
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
    
    protonet.Notifications.trigger("meep.render_from_form", [this.form, true]);
    protonet.Notifications.trigger("form.submitted", [this.form]);
    
    this.input.val("");
  }
};