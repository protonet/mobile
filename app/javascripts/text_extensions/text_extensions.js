(function() {
  var queue = [],
      currentChannelId;
  
  protonet
    .bind("channel.change", function(e, channelId) {
      currentChannelId = channelId;
      _renderQueue(channelId);
    })
    .bind("meep.rendered", function(e, meepElement, meepData) {
      if (!meepData.text_extension) {
        return;
      }
      
      // Put text extension rendering into a queue when channel isn't selected
      if ($.type(meepData.channel_id) == "number" && meepData.channel_id != currentChannelId) {
        queue.push({ data: meepData, element: meepElement });
        return;
      }
      
      var output = _getOutputElement(meepElement);
      protonet.text_extensions.render(output, meepData.text_extension);
    });
  
  function _renderQueue(channelId) {
    queue = $.map(queue, function(meep) {
      if (meep.data.channel_id != currentChannelId) {
        return meep;
      }

      var output = _getOutputElement(meep.element);
      protonet.text_extensions.render(output, meep.data.text_extension);
      return null;
    });
  }
  
  function _getOutputElement(element) {
    return element.find(".text-extension-container");
  }
})();

//= require "config.js"
//= require "input.js"
//= require "render.js"
//= require "provider.js"