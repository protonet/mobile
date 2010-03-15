//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"
//= require "../utils/convert_to_pretty_date.js"
//= require "../utils/highlight_replies.js"

protonet.controls.Tweet = (function() {
  var template,
      templateHtml,
      HALF_HOUR = 1000 * 60 * 30,
      ID_REG_EXP = /\{id\}/g,
      TWEET_REG_EXP = /tweet-(\d*)-\d*/;
  
  function TweetClass(args) {
    this.originalMessage  = args.message;
    this.message          = this.originalMessage;
    this.message          = protonet.utils.escapeHtml(this.message);
    this.message          = protonet.utils.highlightReplies(this.message);
    this.message          = protonet.utils.autoLink(this.message);
    this.message          = protonet.utils.nl2br(this.message);
    this.message          = protonet.utils.autoLinkFilePaths(this.message);
    this.author           = args.author;
    this.messageDate      = new Date();
    this.channelId        = args.channel_id;
    this.textExtension    = args.text_extension;
    this.form             = args.form;
    this.id               = args.id;
    
    template = template || $("#message-template");
    templateHtml = templateHtml || $(template.html());
    
    this.listElement = templateHtml.clone();
    if(this.id) {
      this.htmlId = this.listElement.attr("id").replace(ID_REG_EXP, this.id);
    }
    this.listElement.attr("id", this.htmlId);
    this.listElement.find(".message-usericon > img").attr("src", args.user_icon_url);
    this.listElement.find(".message-author").html(this.author);
    this.listElement.find(".message-date")
      .attr("title", this.messageDate)
      .html(protonet.utils.convertToPrettyDate(this.messageDate));
    
    var messageContainer = this.listElement.find(".message-text");
    messageContainer.find("p").append(this.message);
    
    if (this.textExtension) {
      if (this.channelId == protonet.globals.channelSelector.getCurrentChannelId()) {
        protonet.controls.TextExtension.render(messageContainer, this.textExtension);
      } else {
        // Put in queue, so that it gets rendered when the channel is focused
        protonet.globals.textExtensions.push({
          data: this.textExtension,
          container_id: this.htmlId,
          channel_id: this.channelId
        });
      }
    }
    
    var scrollPosition = $(window).scrollTop();
    
    this.channelUl = $("#messages-for-channel-" + this.channelId);
    this.lastTweet = this.channelUl.children(":first");
    var lastTweetHappenedInLastHalfHour = this.messageDate - new Date(this.lastTweet.find(".message-date").attr("title")) < HALF_HOUR;
    this.groupedTweet = this.lastTweet.length
        && lastTweetHappenedInLastHalfHour
        && !this.textExtension
        && this.lastTweet.find(".message-author").html() == this.author;
        
    if (this.groupedTweet) {
      this.lastTweet.find(".message-text").prepend(messageContainer.html());
      // not available if tweet is locally created i.e. users own tweet
      //  filled by callback in send
      if (this.id) {
        this.replace_first_tweet_id_in_merge(this.id);
      }
    } else {
      this.channelUl.prepend(this.listElement);
    }
    
    /**
     * Avoid user experience problems when user scrolls down to read a tweet while others are pushing
     * new tweets
     */
    if (scrollPosition > 150) {
      $(window).scrollTop(scrollPosition + this.listElement.outerHeight(true));
    }
  };
  
  TweetClass.prototype = {
    send: function() {
      var params = this.form.serialize();
      // Overwrite message, because we don't always want to send the textarea value
      params += "&" + encodeURIComponent("tweet[message]=" + this.originalMessage);
      
      // send to server
      $.post(this.form.attr("action"), params, function(data){
        this.htmlId = this.listElement.attr("id");
        
        if(!this.groupedTweet) {
          this.htmlId = this.htmlId.replace(ID_REG_EXP, data);
          this.listElement.attr("id", this.htmlId);
        } else {
          this.replace_first_tweet_id_in_merge(data);
        }
      }.bind(this));
    },
    
    replace_first_tweet_id_in_merge: function(id) {
      var wrapperId = this.lastTweet.attr("id");
      var firstId = wrapperId.match(TWEET_REG_EXP)[1];
      var htmlId = wrapperId.replace("tweet-" + firstId, "tweet-" + id);
      this.lastTweet.attr("id", htmlId);
    }
  };
  
  return TweetClass;
})();