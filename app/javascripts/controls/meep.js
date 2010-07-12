//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"
//= require "../utils/convert_to_pretty_date.js"
//= require "../utils/highlight_replies.js"
//= require "../utils/template.js"

protonet.controls.Meep = function(meepData) {
  this.meepData = meepData;
  this.meepData.message = this.prepareMessage(this.meepData.message);
};

protonet.controls.Meep.prototype = {
  /**
   * Configuration
   */
  config: {
    SHOULD_BE_MERGED_TIME: 1000 * 60 * 15 // 15 minutes
  },
  
  prepareMessage: function(message) {
    $.each([ 
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
    var html = new protonet.utils.Template("meep-template", this.meepData).toString();
    channelList.prepend(html);
    
    protonet.Notifications.trigger("meep.render", this.meepData);
  }
};