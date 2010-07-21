//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"
//= require "../utils/highlight_replies.js"
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
 */
protonet.timeline.Meep = function(dataOrForm) {
  var isFormElement = dataOrForm.jquery;
  if (isFormElement) {
    this.queryString = dataOrForm.serialize();
    this.data = protonet.utils.parseQueryString(this.queryString).tweet;
    $.extend(this.data, { created_at: new Date().toString() });
  } else {
    this.data = dataOrForm;
  }
};

protonet.timeline.Meep.prototype = {
  /**
   * Configuration
   */
  config: {
    // Merge/combine meeps that were send in a particular timeframe
    SHOULD_BE_MERGED_TIME: 1000 * 60 * 15,
    // Url to post the meep to
    POST_URL:              "/tweets"
  },
  
  _convertMessage: function(message) {
    $.each([
      // Order of functions is essential!
      protonet.utils.escapeHtml,
      protonet.utils.highlightReplies.highlightInStream,
      protonet.utils.autoLink,
      protonet.utils.nl2br,
      protonet.utils.autoLinkFilePaths
    ], function(i, method) {
      message = method(message);
    });
    
    return message;
  },
  
  render: function(channelList) {
    $.extend(this.data, { converted_message: this._convertMessage(this.data.message) });
    
    this.element = new protonet.utils.Template("meep-template", this.data).toElement()
      .data({ meep: this.data, instance: this }).prependTo(channelList);
    
    protonet.Notifications.trigger("meep.rendered", [this.element, this.data, this]);
    return this;
  },
  
  post: function(onSuccess, onFailure) {
    $.ajax({
      url:        this.config.POST_URL,
      type:       "POST",
      data:       this.queryString || $.param({ tweet: this.data }),
      success:    onSuccess,
      error:      onFailure
    });
    
    protonet.Notifications.trigger("meep.sent", [this.element, this.data, this]);
    
    return this;
  }
};