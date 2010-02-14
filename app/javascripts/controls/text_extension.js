protonet.controls.TextExtension = {
  initialize: function() {
    protonet.globals.channelSelector.onSwitch(this.renderQueue.bind(this));
    $(this.renderQueue.bind(this));
  },
  
  renderQueue: function() {
    if (protonet.globals.textExtensions && protonet.globals.textExtensions.length) {
      var currentChannelId = protonet.globals.channelSelector.getCurrentChannelId();
      protonet.globals.textExtensions = $.map(protonet.globals.textExtensions, function(extension) {
        if (extension.channel_id == currentChannelId) {
          var container = $("#" + extension.container_id + " > .message-text");
          new this.Renderer(container, extension.data);
          return null; // to remove the element from the array
        } else {
          return extension;
        }
      }.bind(this));
    }
  },
  
  render: function(container, data) {
    return new this.Renderer(container, data);
  }
};

//= require "text_extension/renderer.js"
//= require "text_extension/input.js"
//= require "text_extension/providers.js"