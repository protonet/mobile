//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"
//= require "../utils/smilify.js"
//= require "../utils/heartify.js"
//= require "../utils/codify.js"
//= require "../utils/highlight_channel_replies.js"
//= require "../utils/template.js"
//= require "../utils/parse_query_string.js"

/**
 * @example
 *    // only render meep
 *    new protonet.timeline.Meep({ message: "foo", author: "john.doe" }).render("#container");
 *
 *    // render and post meep (to server)
 *    new protonet.timeline.Meep({ message: "foo", author: "john.doe" }).render("#container").post(callback);
 *    
 *    // render and post meep, based on a form element
 *    var myMeepForm = $("form.meep");
 *    new protonet.timeline.Meep(myMeepForm).render("#container").post(callback);
 *
 *    // merge with last meep and post
 *    var meep = $("#meeps li:first");
 *    new protonet.timeline.Meep({ message: "foo", author: "christopher.blum"}).mergeWith(meep).post(callback);
 *
 * @events
 *    meep.rendered - A new meep has been inserted into the DOM
 *    meep.render   - Trigger this event with channelId and meep data or form if you want a new meep to be rendered
 *    meep.sent     - A new meep has been sent to the server
 *    meep.error    - Posting a new meep has been failed
 */
protonet.timeline.Meep = function(dataOrForm) {
  var isFormElement = dataOrForm.jquery && dataOrForm.attr;
  if (isFormElement) {
    this.data = this._parseForm(dataOrForm);
  } else {
    this.data = dataOrForm;
  }
};

protonet.timeline.Meep.prototype = {
  /**
   * Configuration
   */
  config: {
    // Url to post the meep to
    POST_URL:              "/tweets"
  },
  
  _parseForm: function(form) {
    this.queryString = form.serialize();
    var data = protonet.utils.parseQueryString(this.queryString).tweet;
    
    return $.extend(data, {
      created_at: new Date().toString(),
      text_extension: data.text_extension && JSON.parse(data.text_extension)
    });
  },
  
  _convertMessage: function(message) {
    $.each([
      // Order of functions is essential!
      protonet.utils.escapeHtml,
      protonet.utils.codify,
      protonet.utils.smilify,
      protonet.utils.heartify,
      protonet.utils.highlightChannelReplies,
      protonet.utils.autoLink,
      protonet.utils.nl2br,
      protonet.utils.autoLinkFilePaths
    ], function(i, method) {
      message = method(message);
    });
    
    this.channelReplies = protonet.utils.highlightChannelReplies.result;
    
    return message;
  },
  
  render: function(channelList) {
    this._render("meep-template", channelList);
    return this;
  },
  
  mergeWith: function(meepToMergeWith) {
    this.merged = true;
    
    this._render("meep-to-merge-template", meepToMergeWith);
    this.element = meepToMergeWith;
    
    return this;
  },
  
  /**
   * Private, please use public "render" or "mergeWith"
   */
  _render: function(template, container) {
    var replyFromChannelTemplate, templateData;
    
    if (this.data.reply_from) {
      replyFromChannelTemplate = new protonet.utils.Template("reply-from-channel-template", {
        channel_id: this.data.reply_from,
        channel_name: protonet.timeline.Channels.getChannelName(this.data.reply_from)
      }).toString();
    }
    
    templateData = $.extend({}, this.data, {
      converted_message: this._convertMessage(this.data.message),
      reply_from: replyFromChannelTemplate || ""
    });
    
    this.element = new protonet.utils.Template(template, templateData)
      .toElement()
      .data({ meep: this.data, instance: this })
      .prependTo(container);
    

    
    protonet.Notifications.trigger("meep.rendered", [this.element, this.data, this]);
  },
  
  /**
   * Send the meep to the server
   */
  post: function(onSuccess, onFailure) {
    var status = this.element.find(".status").show().html(protonet.t("MEEP_SENDING"));
    
    $.ajax({
      url:        this.config.POST_URL,
      type:       "POST",
      data:       this.queryString || { tweet: this.data },
      success:    function() {
        if (status.is(":visible")) {
          status.html(protonet.t("MEEP_SENT")).filter(":visible").delay(1000).fadeOut();
        } else {
          status.hide();
        }
        
        (onSuccess || $.noop)();
        protonet.Notifications.trigger("meep.sent", [this.element, this.data, this]);
      }.bind(this),
      error:      function() {
        alert(protonet.t("MEEP_ERROR_LONG"));
        
        status.html(protonet.t("MEEP_ERROR"));
        this.element.find("article").addClass("error");
        
        this.error = true;
        
        (onFailure || $.noop)();
        protonet.Notifications.trigger("meep.error", [this.element, this.data, this]);
      }.bind(this)
    });
    
    return this;
  }
};