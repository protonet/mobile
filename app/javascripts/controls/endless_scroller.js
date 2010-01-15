protonet.controls.EndlessScroller = (function() {

  function EndlessScroller(args) {
    this.loading = false;
    this.channel_id = this.getCurrentChannelId();
    cc.input_channel_id.change(function(){
      this.channel_id = this.getCurrentChannelId();
    }.bind(this));
    this.end_reached = {};
    $(window).scroll(function () { 
      var window_size = $(document).height();
      // where are we?
      var position_from_top = $(window).scrollTop();
      if(!this.end_reached[this.channel_id] && !this.loading && (window_size - position_from_top < 1100)) {
        this.loading = true;
        this.loadNewTweets();
      }
    }.bind(this));
  };
  
  EndlessScroller.prototype = {
    "loadNewTweets": function() {
      var elements = $("#messages-for-channel-" + this.channel_id + " > li");
      first_tweet = elements[elements.size()-1];
      $.get("/tweets", {channel_id : this.channel_id, first_id: first_tweet.id.match(/tweet-(.*)/)[1]}, function(data) {
        if(data=="\n") {
          this.end_reached[this.channel_id] = true;
        } else {
          $("#messages-for-channel-" + this.channel_id).append(data);
          protonet.controls.TextExtension.renderQueue();
          protonet.controls.PrettyDate.update();          
        }
        
        this.loading = false;
        
      }.bind(this));
    },
    
    "getCurrentChannelId": function() {
      return cc.input_channel_id.val();
    }
  };
  
  return EndlessScroller;
  
})();