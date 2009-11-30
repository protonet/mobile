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
  this.text_extension   = new protonet.controls.TextExtension({
    "input": this.input
  });
  
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
    new Tweet({
      "message": this.input.val(),
      "author": this.user_config.user_name,
      "channel_id": this.input_channel_id.val(),
      "user_icon_url": this.user_config.user_icon_url
    });
    $.post(this.form.attr("action"), this.form.serialize());
    this.input.val("");
  },
  
  "receiveMessage": function(message) {
    console.log('cc is receiving message');
    new Tweet({
      "message": message.message,
      "author": message.author,
      "channel_id": message.channel_id,
      "user_icon_url": message.user_icon_url
    });
  }
  
};

function Tweet(args) {
  var self = this;
  
  this.message      = protonet.utils.escapeHtml(args.message);
  this.author       = args.author;
  this.message_date = new Date();
  this.channel_id   = args.channel_id;
  
  this.list_element = $('<li></li>');
  this.user_icon    = $('<span class="message-usericon"><img width="47" height="47" alt="" src="' + args.user_icon_url + '"/></span>');
  console.log(this.user_icon);
  this.paragraph    = $('<p></p>');
  this.message_info = '<span class="message-info"> <span class="message-author">' + this.author + '</span> <span class="message-date">(' + this.message_date + ')</span></span>';

  this.list_element.append(this.user_icon);
  this.list_element.append(this.paragraph);
  this.paragraph.append(this.message_info);
  this.paragraph.append(this.message);
  this.channel_ul = $('#messages-for-channel-' + this.channel_id);
  this.channel_ul.prepend(this.list_element);
}

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