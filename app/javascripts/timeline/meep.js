//= require "../behaviors/meeps.js"
//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/highlight_keyword.js"
//= require "../utils/smilify.js"
//= require "../utils/heartify.js"
//= require "../utils/codify.js"
//= require "../utils/quotify.js"
//= require "../utils/highlight_channel_replies.js"
//= require "../utils/highlight_user_replies.js"
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
 *    // render meep and highlight the word "foo" in the meep message as well as in the text extension
 *    // please note that the highlighting of keywords only works after the rendering
 *    new protonet.timeline.Meep(myMeepForm).highlight("foo").render("#container")
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
    POST_URL: "/tweets"
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
      protonet.utils.quotify,
      protonet.utils.codify,
      protonet.utils.smilify,
      protonet.utils.heartify,
      protonet.utils.highlightChannelReplies,
      protonet.utils.highlightUserReplies,
      protonet.utils.autoLink,
      protonet.utils.autoLinkFilePaths
    ], function(i, method) {
      message = method(message);
    });
    
    this.userReplies = protonet.utils.highlightUserReplies.result;
    this.channelReplies = protonet.utils.highlightChannelReplies.result;
    
    return message;
  },
  
  highlight: function(keywords) {
    var element = this.element[0];
    keywords = keywords.split(/\s+/);
    $.each(keywords, function(i, keyword) {
      protonet.utils.highlightKeyword(keyword, element);
    });
    return this;
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
    var replyFromChannelTemplate, postedInChannelTemplate, templateData;
    
    if (this.data.reply_from) {
      replyFromChannelTemplate = new protonet.utils.Template("reply-from-channel-template", {
        channel_id: this.data.reply_from,
        channel_name: protonet.timeline.Channels.getChannelName(this.data.reply_from)
      }).toString();
    }
    
    if (this.data.posted_in) {
      postedInChannelTemplate = new protonet.utils.Template("posted-in-channel-template", {
        channel_id: this.data.posted_in,
        channel_name: protonet.timeline.Channels.getChannelName(this.data.posted_in)
      }).toString();
    }
    
    templateData = $.extend({}, this.data, {
      converted_message: this._convertMessage(this.data.message),
      reply_from: replyFromChannelTemplate || "",
      posted_in:  postedInChannelTemplate || ""
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
    
    this.queryString = this.queryString || $.param({
      tweet: $.extend({}, this.data, {
        text_extension: JSON.stringify(this.data.text_extension)
      })
    });
    
    var ajaxOptions = {
      url:        this.config.POST_URL,
      type:       "POST",
      data:       this.queryString,
      success:    function(response, text, xhr) {
        /**
         * "I'm a little more country than that ..."
         * When the server is offline jquery still assumes
         * that the request succeeded
         * Such requests can be detected by manually checking
         * the http status
         */
        if (!xhr.status) {
          ajaxOptions.error();
          return;
        }
        
        if (status.is(":visible")) {
          status.html(protonet.t("MEEP_SENT")).delay(1000).fadeOut();
        } else {
          status.hide();
        }
        
        this.data.id = +response;
        
        (onSuccess || $.noop)();
        protonet.Notifications.trigger("meep.sent", [this.element, this.data, this]);
      }.bind(this),
      error:      function() {
        protonet.Notifications.trigger("flash_message.error", protonet.t("MEEP_ERROR_LONG"));
        
        var element = this.merged ? this.element.find("article:first") : this.element;
        element.addClass("error").delay(5000).fadeOut();
        status.html(protonet.t("MEEP_ERROR")).delay(5000).fadeOut();
        
        this.error = true;
        
        (onFailure || $.noop)();
        protonet.Notifications.trigger("meep.error", [this.element, this.data, this]);
      }.bind(this)
    };
    
    $.ajax(ajaxOptions);
    
    return this;
  }
};