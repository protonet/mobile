protonet.controls.CommunicationConsole = function(args) {
  // elements
  this.input = $("#message");
  this.form = $("#message-form");
  this.input_channel_id = $("#message_channel_id");
  
  // add sub views
  this.channel_selector = new ChannelSelector({"parent_widget": this});
  this.input_console    = new protonet.controls.InputConsole({
    "input_console": this.input,
    "parent_widget": this,
    "form": this.form
  });
  this.text_extension   = new protonet.controls.TextExtension({"input": this.input});
  
  // this.room_viewer        = new ChatRoomViewer({'parent_widget': this});
  // this.chat_input         = new ChatInput({'parent_widget': this});
  
  // who am I? isn't that what we all want to know? ;)
  
  // make it a global user object
  this.user_config      = args.config;
  this.current_user_id  = args.config.user_id;
  
  // active informations
  this.active_feed_id = 1; // home
  this.feeds = args.feed_ids || {};
  
  // load room chooser
  // this thing is displayed by default with the currently
  // available data so it doesn't need to be dependent on the
  // room activation process
  // this.activateFeedSelector();
  
  // keep it simple, no init for now
  // this.openLobby();
  
  // this.listenToUserInput();
  
  // preload feeds
  // $('.user-messages').load('/channels/2/tweets')
  
  // set correct status
  // $('#js-status').
};

protonet.controls.CommunicationConsole.prototype = {
  "addAndSendTweet": function() {
    // render
    new protonet.controls.Tweet({
      "message": this.input.val(),
      "text_extension": this.text_extension,
      "author": this.user_config.user_name,
      "channel_id": this.input_channel_id.val(),
      "user_icon_url": this.user_config.user_icon_url
    });
    
    // send to server
    $.post(this.form.attr("action"), this.form.serialize());
    this.input.val("");
  },
  
  "receiveMessage": function(message) {
    console.log('cc is receiving message');
    new protonet.controls.Tweet({
      "message": message.message,
      "author": message.author,
      "channel_id": message.channel_id,
      "user_icon_url": message.user_icon_url,
      "text_extension": message.text_extension
    });
  }
  
};

protonet.controls.Tweet = (function() {
  var template;
  
  return function(args) {
    this.message      = protonet.utils.escapeHtml(args.message);
    this.author       = args.author;
    this.message_date = new Date();
    this.channel_id   = args.channel_id;
    
    template = template || $("#message-template");
    
    this.list_element = $(template.html());
    this.list_element.find(".message-usericon > img").attr("src", args.user_icon_url);
    this.list_element.find(".message-author").html(this.author);
    this.list_element.find(".message-date").html(this.message_date);
    this.list_element.find("p").append(this.message);
    
    this.channel_ul = $('#messages-for-channel-' + this.channel_id);
    this.channel_ul.prepend(this.list_element);
    
    args.text_extension.reset();
  };
})();
  
function ChannelSelector(args) {
  var self = this;
  
  // get container
  this.container = $('#channel');
  
  // get feed-holder
  this.feed_holder = $("#feed-holder");
    
  // get all channel links and bind click
  this.container.find('.channel a').click(function(){
    // get the index of the element
    var index = parseInt(this.href.match(/index=([0-9]*)/)[1], 10);
    // get id of channel
    var channel_id = parseInt(this.href.match(/channel_id=([0-9]*)/)[1], 10);
    self.feed_holder.animate({'left': index * -613}, 'fast');
    self.container.find('.active').toggleClass('active');
    $(this).parent('li').toggleClass('active');
    // set form channel_id to correct value
    args.parent_widget.input_channel_id.val(channel_id);
    return false;
  });
}