function CommunicationConsole(args) {
  var self = this;
  
  // add sub views
  this.audience_selector  = new AudienceSelector({'parent_widget': this});
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
    self.feed_holder.animate({'left': index * -604}, 'fast');
    self.container.find('.active').toggleClass('active');
    $(this).parent('li').toggleClass('active')
    return false;
  });
}