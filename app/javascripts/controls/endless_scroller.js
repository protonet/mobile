//= require "../lib/jquery.inview.js"

protonet.controls.EndlessScroller = (function() {
  var REG_EXP_CHANNEL_ID = /messages-for-channel-(\d*)/,
      REG_EXP_TWEET_INDEX = /tweet-(\d*)-(\d*)/;
  
  function EndlessScroller(args) {
    this.channelId = protonet.globals.channelSelector.getCurrentChannelId();
    this._observe();
    
    protonet.globals.channelSelector.onSwitch(function() {
      var oldChannel = $("#messages-for-channel-" + this.channelId);
      oldChannel.children().unbind("inview");
      this.channelId = protonet.globals.channelSelector.getCurrentChannelId();
      
      this._observe();
    }.bind(this));
  };
  
  EndlessScroller.prototype = {
    "_observe": function() {
      var channel = $("#messages-for-channel-" + this.channelId),
          lastTweet = channel.children("li:last-child");
      lastTweet.bind("inview", function() {
        lastTweet.unbind("inview");
        this.loadNewTweets(lastTweet, channel);
      }.bind(this));
    },
    
    "loadNewTweets": function(lastTweet, channel) {
      var params = {
        channel_id: this.channelId,
        first_id: lastTweet.attr("id").match(REG_EXP_TWEET_INDEX)[2]
      };
      
      $.get("/tweets", params, function(data) {
        if ($.trim(data)) {
          channel.append(data);
          
          // Ok, let the browser breathe and then do the rest
          setTimeout(function() {
            protonet.controls.TextExtension.renderQueue();
            protonet.controls.PrettyDate.update();
          }, 100);
          this._observe();
        }
      }.bind(this));
    },
    
    "loadNotReceivedTweets": function() {
      var channels = $("#feed-viewer ul");
      channels.each(function(i){
      
        var channel = $(channels[i]);
        var firstTweet = channel.children("li:first-child");
        if(firstTweet.attr("id").match(REG_EXP_TWEET_INDEX)) {
          var params = {
            channel_id: channel.attr("id").match(REG_EXP_CHANNEL_ID)[1],
            last_id: firstTweet.attr("id").match(REG_EXP_TWEET_INDEX)[1]
          };

          $.get("/tweets", params, function(data) {
            if ($.trim(data)) {
              channel.prepend(data);

              // Ok, let the browser breathe and then do the rest
              setTimeout(function() {
                protonet.controls.TextExtension.renderQueue();
                protonet.controls.PrettyDate.update();
              }, 100);
              this._observe();
            }
          }.bind(this));          
        }
      
      });
      
    }
  };
  
  return EndlessScroller;
  
})();