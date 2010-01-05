//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"

protonet.controls.Tweet = (function() {
  var template;
  
  function TweetClass(args) {
    this.originalMessage  = args.message;
    this.message          = protonet.utils.escapeHtml(this.originalMessage);
    this.message          = protonet.utils.nl2br(this.message);
    this.message          = protonet.utils.autoLink(this.message);
    this.message          = protonet.utils.autoLinkFilePaths(this.message);
    this.author           = args.author;
    this.message_date     = new Date();
    this.channel_id       = args.channel_id;
    this.text_extension   = args.text_extension;
    this.form             = args.form;
    
    template = template || $("#message-template");
    
    this.list_element = $(template.html());
    this.list_element.find(".message-usericon > img").attr("src", args.user_icon_url);
    this.list_element.find(".message-author").html(this.author);
    this.list_element.find(".message-date").html(this.message_date.toGMTString());
    
    var messageContainer = this.list_element.find(".message-text");
    messageContainer.find("p").append(this.message);
    
    if (this.text_extension) {
      protonet.controls.TextExtension.render(messageContainer, this.text_extension);
    }
    
    this.channel_ul = $("#messages-for-channel-" + this.channel_id);
    this.channel_ul.prepend(this.list_element);
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