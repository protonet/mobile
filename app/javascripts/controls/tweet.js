//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"
//= require "../utils/convert_to_pretty_date.js"
//= require "../utils/highlight_replies.js"

protonet.controls.Tweet = (function() {
  var template,
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
    this.messageDate      = new Date();
    this.author           = args.author;
    this.user_icon_url    = args.user_icon_url;
    this.channelId        = args.channel_id;
    this.textExtension    = args.text_extension;
    this.form             = args.form;
    this.id               = args.id;
    
    this.listElement = this.getTemplate();
    
    if (this.id) {
      this.htmlId = this.listElement.attr("id").replace(ID_REG_EXP, this.id);
      this.listElement.attr("id", this.htmlId);
    }
    
    this.listElement.find(".message-usericon > img").attr("src", this.user_icon_url);
    this.listElement.find(".message-author").html(this.author);
    this.listElement.find(".message-date")
      .attr("title", this.messageDate)
      .html(protonet.utils.convertToPrettyDate(this.messageDate));
    
    var messageContainer = this.listElement.find(".message-text");
    messageContainer.find("p").append(this.message);
    var isCurrentChannel = (this.channelId == protonet.globals.channelSelector.getCurrentChannelId());
    
    if (this.textExtension) {
      if (isCurrentChannel) {
        protonet.text_extensions.render(messageContainer, this.textExtension);
      } else {
        // Put text extension in queue, so that it gets rendered when the channel is focused
        protonet.globals.textExtensions.push({
          data: this.textExtension,
          container_id: this.htmlId,
          channel_id: this.channelId
        });
      }
    }
    
    this.channelUl = $("#messages-for-channel-" + this.channelId);
    this.previousTweetElement = this.channelUl.children(":first");
    this.shouldBeMerged = this.isMergedTweet();
    
    var scrollPosition = $(window).scrollTop();
    var oldChannelHeight = this.channelUl.height();
    var channelOffsetTop = this.channelUl.offset().top;
    
    if (this.shouldBeMerged) {
      this.previousTweetElement.find(".message-text").prepend(messageContainer.html());
      // not available if tweet is locally created i.e. users own tweet
      // filled by callback in send
      this.id && this.replaceFirstTweetIdInMerge(this.id);
    } else {
      this.channelUl.prepend(this.listElement);
    }
    
    // highlight my mentions
    protonet.globals.communicationConsole.highlightReplies();

    var newChannelHeight = this.channelUl.height();
    
    /**
     * Avoid user experience problems when user scrolls down to read a tweet while others are pushing
     * new tweets
     */
    if (isCurrentChannel && scrollPosition > channelOffsetTop) {
      $(window).scrollTop(scrollPosition + newChannelHeight - oldChannelHeight);
    }
  };
  
  TweetClass.prototype = {
    send: function() {
      var params = this.form.serialize();
      // Overwrite message, because we don't always want to send the textarea value
      params += "&" + $.param({ "tweet[message]": this.originalMessage });
      
      // send to server
      $.ajax({
        type:     "POST",
        url:      this.form.attr("action"),
        data:     params,
        success:  function(response) {
          alert("success");
          if (this.shouldBeMerged) {
            this.replaceFirstTweetIdInMerge(response);
          } else {
            this.htmlId = this.listElement.attr("id");
            this.htmlId = this.htmlId.replace(ID_REG_EXP, response);
            this.listElement.attr("id", this.htmlId);
          }
          
          // Remove unsent messages after success
          this.channelUl.find(".unsent").remove();
        }.bind(this),
        
        error:    function() {
          alert("Ooops, something went wrong. Your message hasn't been sent.");
          this.listElement.addClass("unsent").css("opacity", 0.5);
        }.bind(this)
      });
    },
    
    replaceFirstTweetIdInMerge: function(id) {
      var wrapperId = this.previousTweetElement.attr("id");
      var firstId = wrapperId.match(TWEET_REG_EXP)[1];
      var htmlId = wrapperId.replace("tweet-" + firstId, "tweet-" + id);
      this.previousTweetElement.attr("id", htmlId);
    },
    
    isMergedTweet: function() {
      if (this.previousTweetElement.length == 0) {
        return false;
      }
      
      var previousTweet = {
        date: new Date(this.previousTweetElement.find(".message-date").attr("title")),
        author: this.previousTweetElement.find(".message-author").html()
      };
      
      var timeDifference = this.messageDate - previousTweet.date;
      var sameAuthor = previousTweet.author == this.author;
      var previousTweetHappenedInLastHalfHour = timeDifference < HALF_HOUR;
      var isMergedTweet = previousTweetHappenedInLastHalfHour && sameAuthor && !this.textExtension;
      
      return isMergedTweet;
    },
    
    getTemplate: function() {
      template = template || $($("#message-template").html());
      return template.clone();
    }
  };
  
  return TweetClass;
})();