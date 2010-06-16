protonet.text_extensions = {
  initialize: function(currentChannelId) {
    protonet.Notifications.bind("channel.changed messages.new", this.renderQueue.bind(this));
    
    $(this.renderQueue.bind(this, null, currentChannelId));
  },
  
  renderQueue: function(e, currentChannelId) {
    if (protonet.globals.textExtensions && protonet.globals.textExtensions.length) {
      protonet.globals.textExtensions = $.map(protonet.globals.textExtensions, function(extension) {
        if (extension.channel_id == currentChannelId) {
          var container = $("#" + extension.container_id + " > .message-text");
          this.render(container, extension.data);
          return null; // to remove the element from the array
        } else {
          return extension;
        }
      }.bind(this));
    }
  }
};

//= require "config.js"
//= require "input.js"
//= require "render.js"
//= require "provider.js"