(function() {
  var queue = [],
      currentChannelId;
  
  protonet
    .on("channel.change", function(channelId) {
      currentChannelId = channelId;
      setTimeout(function() {
        _renderQueue(channelId);
      }, 0);
    })
    .on("meep.rendered", function($meepElement, meepData) {
      if (!meepData.text_extension) {
        return;
      }
      
      // Put text extension rendering into a queue when channel isn't selected
      if (typeof(meepData.channel_id) == "number" && meepData.channel_id != currentChannelId) {
        queue.push({ data: meepData, $element: $meepElement });
        return;
      }
      
      protonet.text_extensions.render(meepData.text_extension).insertBefore($meepElement.find(".author"));
    });
  
  function _renderQueue(channelId) {
    queue = $.map(queue, function(meep) {
      if (meep.data.channel_id != currentChannelId) {
        return meep;
      }
      
      protonet.text_extensions.render(meep.data.text_extension).insertBefore(meep.$element.find(".author"));
      return null; // null tells $.map to remove it from the newly created array
    });
  }
})();

//= require "config.js"
//= require "input.js"
//= require "render.js"
//= require "provider.js"