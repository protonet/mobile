protonet.text_extensions = {
  initialize: function(currentChannelId) {
    this.queue = [];
    this.currentChannelId = currentChannelId;
    
    protonet.Notifications.bind("meep.rendered", function(e, meepElement, meepData) {
      if (!meepData.text_extension) {
        return;
      }
      
      // Put text extension rendering into a queue when channel isn't selected
      if ($.type(meepData.channel_id) == "number" && meepData.channel_id != this.currentChannelId) {
        this.queue.push({ data: meepData, element: meepElement });
        return;
      }
      
      var output = this._getOutputElement(meepElement);
      this.render(output, meepData.text_extension);
    }.bind(this));
    
    protonet.Notifications.bind("channel.change", function(e, channelId) {
      this.currentChannelId = channelId;
      this.renderQueue(channelId);
    }.bind(this));
  },
  
  renderQueue: function(channelId) {
    this.queue = $.map(this.queue, function(meep) {
      if (meep.data.channel_id != this.currentChannelId) {
        return meep;
      }
      
      var output = this._getOutputElement(meep.element);
      this.render(output, meep.data.text_extension);
      return null;
    }.bind(this));
  },
  
  _getOutputElement: function(element) {
    return element.find(".text-extension-container");
  }
};

//= require "config.js"
//= require "input.js"
//= require "render.js"
//= require "provider.js"