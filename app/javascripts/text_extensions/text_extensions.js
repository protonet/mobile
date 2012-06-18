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
      // Old nodes will create text extensions with "null" value
      if (typeof(meepData.text_extension) !== "object") {
        return;
      }
      
      // Put text extension rendering into a queue when channel isn't selected
      if (typeof(meepData.channel_id) == "number" && meepData.channel_id != currentChannelId) {
        queue.push({ data: meepData, $element: $meepElement });
        return;
      }
      
      _render($meepElement, meepData);
    })
    .on("text_extension.rerender", _reRender);
  
  function _render($meepElement, meepData) {
    var textExtension = protonet.text_extensions.utils.insertBaseUrl(meepData.text_extension),
        text          = $.trim(meepData.message),
        $article      = $meepElement.find("article:last"),
        $author       = $meepElement.find(".author");
    
    protonet.text_extensions.render(textExtension).insertBefore($author);
    if (text === textExtension.url || ("http://" + text) === textExtension.url) {
      $article.addClass("empty").empty();
    }
  }
  
  function _reRender($meepElement, meepData) {
    $meepElement.find(".text-extension-results").remove();
    _render($meepElement, meepData);
  }
  
  function _renderQueue(channelId) {
    queue = $.map(queue, function(meep) {
      if (meep.data.channel_id != currentChannelId) {
        return meep;
      }
      
      _render(meep.$element, meep.data);
      return null; // null tells $.map to remove it from the newly created array
    });
  }
})();

//= require "config.js"
//= require "input.js"
//= require "render.js"
//= require "provider.js"