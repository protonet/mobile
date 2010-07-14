protonet.text_extensions = {
  initialize: function(currentChannelId) {
    protonet.Notifications.bind("meep.rendered", function(e, meepElement, meepData) {
      if (!meepData.text_extension) {
        return;
      }
      
      container = meepElement.find(".text-extension-container");
      this.render(container, meepData.text_extension);
    }.bind(this));
  },
  
  renderQueue: function(e, currentChannelId) {
    // if (protonet.globals.textExtensions && protonet.globals.textExtensions.length) {
    //   protonet.globals.textExtensions = $.map(protonet.globals.textExtensions, function(extension) {
    //     if (extension.channel_id == currentChannelId) {
    //       var container = $("#" + extension.container_id + " > article:last .text-extension-container");
    //       this.render(container, extension.data);
    //       return null; // to remove the element from the array
    //     } else {
    //       return extension;
    //     }
    //   }.bind(this));
    // }
  }
};

//= require "config.js"
//= require "input.js"
//= require "render.js"
//= require "provider.js"