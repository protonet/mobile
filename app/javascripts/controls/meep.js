//= require "../utils/auto_link.js"
//= require "../utils/auto_link_file_paths.js"
//= require "../utils/escape_html.js"
//= require "../utils/nl2br.js"
//= require "../utils/convert_to_pretty_date.js"
//= require "../utils/highlight_replies.js"
//= require "../utils/template.js"

protonet.controls.Meep = function(data) {
  this.data = data;
  this.id   = data.id;
  
  this.data = this._prepareData(this.data);
};

protonet.controls.Meep.prototype = {
  /**
   * Configuration
   */
  config: {
    // Merge/combine meeps that were send in a particular timeframe
    SHOULD_BE_MERGED_TIME: 1000 * 60 * 15
  },
  
  _prepareData: function(data) {
    data.message    = this._prepareMessage(data.message);
    return data;
  },
  
  _prepareMessage: function(message) {
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
    this.element = new protonet.utils.Template("meep-template", this.data).toElement();
    this.element.data({ meep: this.data, instance: this });
    
    channelList.prepend(this.element);
    
    protonet.Notifications.trigger("meep.rendered", [this.element, this.data, this]);
    
    return this;
  },
  
  send: function() {
    $.post();
    
    protonet.Notifications.trigger("meep.sent", [this.element, this.data, this]);
    
    return this;
  }
};