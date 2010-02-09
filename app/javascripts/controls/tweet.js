//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"
//= require "../utils/convert_to_pretty_date.js"

protonet.controls.Tweet = (function() {
  var template,
      HALF_HOUR = 1000 * 60 * 30;
  
  function TweetClass(args) {
    this.originalMessage  = args.message;
    this.message          = protonet.utils.escapeHtml(this.originalMessage);
    this.message          = protonet.utils.autoLink(this.message);
    this.message          = protonet.utils.nl2br(this.message);
    this.message          = protonet.utils.autoLinkFilePaths(this.message);
    this.author           = args.author;
    this.messageDate      = new Date();
    this.channelId        = args.channel_id;
    this.textExtension    = args.text_extension;
    this.form             = args.form;
    
    template = template || $("#message-template");
    
    this.listElement = $(template.html());
    this.listElement.find(".message-usericon > img").attr("src", args.user_icon_url);
    this.listElement.find(".message-author").html(this.author);
    this.listElement.find(".message-date")
      .attr("title", this.messageDate)
      .html(protonet.utils.convertToPrettyDate(this.messageDate));
    
    var messageContainer = this.listElement.find(".message-text");
    messageContainer.find("p").append(this.message);
    
    if (this.textExtension) {
      protonet.controls.TextExtension.render(messageContainer, this.textExtension);
    }
    
    this.channelUl = $("#messages-for-channel-" + this.channelId);
    var scrollPosition = $(window).scrollTop();
    var lastTweet = this.channelUl.find(":first-child");
    var lastTweetHappenedInLastHalfHour = this.messageDate - new Date(lastTweet.find(".message-date").attr("title")) < HALF_HOUR;
    var canBeGroupedWithLastTweet = lastTweet.length
        && lastTweetHappenedInLastHalfHour
        && !this.textExtension
        && lastTweet.find(".message-author").html() == this.author;
        
    if (canBeGroupedWithLastTweet) {
      lastTweet.find(".message-text").prepend(messageContainer.html());
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
      $.post(this.form.attr("action"), params);
    }
  };
  
  return TweetClass;
})();