//= require "../lib/jquery.inview.js"

protonet.controls.EndlessScroller = (function() {
  var REG_EXP_CHANNEL_ID = /messages-for-channel-(\d*)/,
      REG_EXP_TWEET_INDEX = /tweet-(\d*)-(\d*)/;
  
  function EndlessScroller() {
    this.channelId = protonet.timeline.Channels.selected;
    this._observe();
    
    protonet.Notifications.bind("channel.changed", function(e, newChannelId) {
      var oldChannel = $("#messages-for-channel-" + this.channelId);
      
      oldChannel.children().unbind("inview");
      this.channelId = newChannelId;
      
      this._observe();
    }.bind(this));
  };
  
  EndlessScroller.prototype = {
    _observe: function() {
      var channel = $("#messages-for-channel-" + this.channelId),
          lastTweet = channel.children("li:last");
      lastTweet.bind("inview", function() {
        lastTweet.unbind("inview");
        this.loadOlderTweets(lastTweet, channel);
      }.bind(this));
    },
    
    loadOlderTweets: function(lastTweet, channel) {
      this._load(channel, {
        channel_id: this.channelId,
        last_id: lastTweet.attr("id").match(REG_EXP_TWEET_INDEX)[2]
      }, "append");
    },
    
    loadNotReceivedTweets: function() {
      var channels = $("#feed-viewer ul");
      channels.each(function(i, channel){
        channel = $(channel);
        var firstTweet = channel.children("li:first-child");
        if (firstTweet.length && firstTweet.attr("id").match(REG_EXP_TWEET_INDEX)) {
          this._load(channel, {
            channel_id: channel.attr("id").match(REG_EXP_CHANNEL_ID)[1],
            first_id: firstTweet.attr("id").match(REG_EXP_TWEET_INDEX)[1]
          }, "prepend", true);
        }
      }.bind(this));
    },
    
    _load: function(channel, params, method, showNotification) {
      $.get("/tweets", params, function(data) {
        if ($.trim(data)) {
          channel[method](data);

          // Ok, let the browser breathe and then do the rest
          setTimeout(function() {
            if (showNotification) {
              protonet.Notifications.trigger("notification.new", params.channel_id);
            }
          }, 200);
          this._observe();
        }
      }.bind(this));
    }
  };
  
  return EndlessScroller;
  
})();