protonet.controls.EndlessScroller = (function() {

  function EndlessScroller(args) {
    this.loading = false;
    this.end_reached = false;
    $(window).scroll(function () { 
      var window_size = $(document).height();
      // where are we?
      var position_from_top = $(window).scrollTop();
      if(!this.end_reached && !this.loading && (window_size - position_from_top < 1100)) {
        this.loading = true;
        this.loadNewTweets();
      }
    }.bind(this));
  };
  
  EndlessScroller.prototype = {
    "loadNewTweets": function() {
      var elements = $("#messages-for-channel-1 > li");
      first_tweet = elements[elements.size()-1];
      $.get("/tweets", {channel_id : 1, first_id: first_tweet.id.match(/tweet-(.*)/)[1]}, function(data) {
        if(data=="\n") {
          this.end_reached = true;
        } else {
          $("#messages-for-channel-1").append(data);
          protonet.controls.TextExtension.renderQueue();
          protonet.controls.PrettyDate.update();          
        }
        
        this.loading = false;
        
      }.bind(this));
    }
  };
  
  return EndlessScroller;
  
})();