//= require "../behaviors/meeps.js"
//= require "../utils/auto_link.js"
//= require "../utils/highlight_keyword.js"
//= require "../utils/smilify.js"
//= require "../utils/emojify.js"
//= require "../utils/heartify.js"
//= require "../utils/codify.js"
//= require "../utils/quotify.js"
//= require "../utils/textify.js"
//= require "../utils/highlight_channel_replies.js"
//= require "../utils/highlight_user_replies.js"
//= require "../utils/parse_query_string.js"
//= require "../utils/deep_equal.js"

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
 *    new protonet.timeline.Meep({ message: "foo", author: "christopher.blum" }).mergeWith(meep).post(callback);
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
 *
 * TODO: Need for speed. Creating & rendering a meep should be fast as hell
 */
(function(protonet) {
  
  var defaultAvatarSize = { width: 36, height: 36 },
      responders        = {},
      responderId       = Math.round(Math.random() * 999),
      POST_URL          = "/meeps";
  
  function postMeep(data, callback) {
    var seq = ++responderId;
    responders[seq] = callback;
    protonet.trigger("socket.send", {
      operation:  "meep.create",
      seq:        seq,
      payload:    data
    });
  }
  
  protonet.bind("meep.created", function(data) {
    var responder = responders[data.seq];
    if (responder) {
      responder(data.status, data.result, data.error);
      delete responders[responderId];
    }
  });
  
  protonet.timeline.Meep = Class.create({
    initialize: function(dataOrForm) {
      var isFormElement = (dataOrForm instanceof jQuery);
      if (isFormElement) {
        this.data = this._parseForm(dataOrForm);
      } else {
        this.data = dataOrForm;
        if(this.data.remote_user_id) {
          this.data.local_user_id = this.data.user_id;
          this.data.user_id       = this.data.remote_user_id;
        }
      }
      this.userReplies = this.channelReplies = [];
    },

    _parseForm: function(form) {
      var data = protonet.utils.parseQueryString(form.serialize()).meep;
      return $.extend(data, {
        channel_id:     +data.channel_id,
        user_id:        protonet.config.user_id,
        avatar:         protonet.data.User.getAvatar(protonet.config.user_id),
        created_at:     new Date().toString(),
        text_extension: data.text_extension && JSON.parse(data.text_extension)
      });
    },

    _convertMessage: function(message) {
      $.each([
        // Order of functions is essential!
        protonet.utils.escapeHtml,
        protonet.utils.quotify,
        protonet.utils.codify,
        protonet.utils.textify,
        protonet.utils.smilify,
        protonet.utils.heartify,
        protonet.utils.emojify,
        protonet.utils.highlightChannelReplies,
        protonet.utils.highlightUserReplies,
        protonet.utils.autoLink
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

    destroy: function() {
      if (this.element.find("article").length > 1) {
        if (this.article.is("article:last-of-type")) {
          // Move data of previous article to merged meep element
          var data = this.article.prev().data();
          this.element.data(data);
          this.element.find(".text-extension-results").remove();
        }
        this.article.remove();
      } else {
        this.element.remove();
      }
      delete this.data;
    },

    getUrl: function() {
      return protonet.data.Meep.getUrl(this.data.id);
    },

    getAvatar: function(size) {
      return protonet.media.Proxy.getImageUrl(this.data.avatar || protonet.config.default_user_avatar, size || defaultAvatarSize);
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
      var replyFromChannelTemplate, postedInChannelTemplate, templateData,
          data = { meep: this.data, instance: this };
      
      if (this.data.reply_from) {
        var channelName = protonet.data.Channel.getName(this.data.reply_from);
        if (channelName) {
          replyFromChannelTemplate = new protonet.utils.Template("reply-from-channel-template", {
            channel_id:   this.data.reply_from,
            channel_name: channelName
          }).toString();
        }
      }

      if (this.data.posted_in) {
        postedInChannelTemplate = new protonet.utils.Template("posted-in-channel-template", {
          channel_id:   this.data.posted_in,
          channel_name: protonet.data.Channel.getName(this.data.posted_in) || protonet.t("UNKNOWN_CHANNEL")
        }).toString();
      }
      templateData = $.extend({}, this.data, {
        avatar:             this.getAvatar(),
        converted_message:  this._convertMessage(this.data.message),
        reply_from:         replyFromChannelTemplate || "",
        posted_in:          postedInChannelTemplate || ""
      });

      this.element = new protonet.utils.Template(template, templateData)
        .to$()
        .prependTo(container);

      this.article = this.element.is("article") ? this.element : this.element.find("article");
      this.article.add(this.element).data(data);

      if (!this.data.message) {
        this.article.addClass("empty");
      }

      protonet.trigger("meep.rendered", this.element, this.data, this);
    },

    /**
     * Send the meep to the server
     */
    post: function(onSuccess, onFailure) {
      this.setStatus(protonet.t("MEEP_SENDING"));
      
      if (!protonet.dispatcher.connected) {
        this.showError(protonet.t("MEEP_ERROR_LONG"));
        return;
      }
      
      var dataToSend = $.extend({}, this.data);
      delete dataToSend.created_at;
      
      postMeep(dataToSend, function(status, newData, error) {
        if (status === "success") {
          this.setStatus(protonet.t("MEEP_SENT"), 1000);
          
          if (newData.text_extension && !protonet.utils.deepEqual(newData.text_extension, this.data.text_extension)) {
            protonet.trigger("text_extension.rerender", this.element, newData);
          }
          
          $.extend(this.data, newData);
          
          (onSuccess || $.noop)();
          
          protonet.trigger("meep.sent", this.data, this.element, this);
        } else {
          var errorMessage;
          if (error === "ENOENT") {
            errorMessage = protonet.t("MEEP_FILE_ERROR");
          } else {
            errorMessage = protonet.t("MEEP_ERROR_LONG");
          }
          this.showError(errorMessage);
          
          (onFailure || $.noop)();
        }
      }.bind(this));
      
      return this;
    },
    
    showError: function(message) {
      var element = this.merged ? this.article : this.element;
      element.addClass("error").delay(5000).fadeOut();

      this.setStatus(protonet.t("MEEP_ERROR"), 5000);

      this.error = true;

      protonet
        .trigger("flash_message.error", message)
        .trigger("meep.error", this.element, this.data, this);
    },

    setStatus: function(html, fadeOutAfter) {
      if (!this.status) {
        var status = this.element.find(".status");
        this.status = status.length && status;
      }

      if (!this.status) {
        this.status = new protonet.utils.Template("meep-status-template")
          .to$()
          .appendTo(this.element.find(".author"));
      }

      this.status.show().html(html);

      if (fadeOutAfter) {
        this.status.delay(fadeOutAfter).fadeOut(function() { $(this).hide(); });
      }

      return this;
    }
  });

})(protonet);
