function CommunicationConsole(args) {
  var self = this;
  
  // add sub views
  this.audience_selector  = new AudienceSelector({'parent_widget': this});
  this.input_console      = new InputConsole({"input_console": $("#message"), "parent_widget": this});
  
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
  // $('.user-messages').load('/audiences/2/tweets')
  
  // set correct status
  // $('#js-status').
}

CommunicationConsole.prototype = {
  
  'foo': function() {
    alert(1);
  },
  
  'addAndSendTweet': function(form) {
    var message = form.find('#message');
    var tweet = new Tweet({'message': message.val(), 'author': this.user_config.user_name, 'audience_id': form.find('#message_audience_id').val()})
    $.post(form.attr('action'), form.serialize());
    message.val('');
  }
  
}

function Tweet(args) {
  var self = this;
  
  this.message      = args.message;
  this.author       = args.author;
  this.message_date = Date();
  this.audience_id  = args.audience_id;
  
  this.list_element = $('<li></li>');
  this.user_icon    = $('<span class="message-usericon"><img width="47" height="47" alt="" src="/img/userpicture.jpg"/></span>');
  this.paragraph    = $('<p></p>');
  this.message_info = '<span class="message-info"> <span class="message-author">' + this.author + '</span> <span class="message-date">(' + this.message_date + ')</span></span>'

  this.list_element.append(this.user_icon);
  this.list_element.append(this.paragraph);
  this.paragraph.append(this.message_info);
  this.paragraph.append(this.message);
  this.audience_ul = $('#messages-for-audience-' + this.audience_id);
  this.audience_ul.prepend(this.list_element)
}

function AudienceSelector(args) {
  var self = this;
  
  // get container
  this.container = $('#audience');
  
  // get feed-holder
  this.feed_holder =$('#feed-holder');
    
  // get all audience links and bind click
  this.container.find('.audience a').click(function(){
    // get the index of the element
    var index = parseInt(this.href.match(/index=([0-9]*)/)[1]);
    // get id of audience
    var audience_id = parseInt(this.href.match(/audience_id=([0-9]*)/)[1]);
    self.feed_holder.animate({'left': index * -604}, 'fast');
    self.container.find('.active').toggleClass('active');
    $(this).parent('li').toggleClass('active');
    // set form audience_id to correct value
    $('#message_audience_id').val(audience_id);
    return false;
  });
}