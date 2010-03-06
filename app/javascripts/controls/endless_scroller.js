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
        this.loadOlderTweets(lastTweet, channel);
      }.bind(this));
    },
    
    "loadOlderTweets": function(lastTweet, channel) {
      this._load(channel, {
        channel_id: this.channelId,
        last_id: lastTweet.attr("id").match(REG_EXP_TWEET_INDEX)[2]
      }, "append");
    },
    
    "loadNotReceivedTweets": function() {
      var channels = $("#feed-viewer ul");
      channels.each(function(i, channel){
        channel = $(channel);
        var firstTweet = channel.children("li:first-child");
        if (firstTweet.length && firstTweet.attr("id").match(REG_EXP_TWEET_INDEX)) {
          this._load(channel, {
            channel_id: channel.attr("id").match(REG_EXP_CHANNEL_ID)[1],
            first_id: firstTweet.attr("id").match(REG_EXP_TWEET_INDEX)[1]
          }, "prepend");
        }
      }.bind(this));
      
      protonet.globals.communicationConsole.notification();
    },
    
    "_load": function(channel, params, method) {
      $.get("/tweets", params, function(data) {
        if ($.trim(data)) {
          channel[method](data);

          // Ok, let the browser breathe and then do the rest
          setTimeout(function() {
            protonet.controls.TextExtension.renderQueue();
            protonet.controls.PrettyDate.update();
          }, 100);
          this._observe();
        }
      }.bind(this));
    }
  };
  
  return EndlessScroller;
  
})();