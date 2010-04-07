protonet.controls.ChannelSelector = (function() {
  var container,
      channelWidth,
      feedHolder,
      channelInput,
      REG_EXP_ELEMENT_INDEX = /index=(\d*)/,
      REG_EXP_CHANNEL_ID = /channel_id=(\d*)/;
  
  function ChannelSelector(params) {
    channelInput = params.channel_input;
    
    container = container || $("#channels");
    feedHolder = feedHolder || $("#feed-holder");
    channelWidth = channelWidth || $("#feed-holder").find("ul:first").outerWidth(true);
    
    this._observe();
  }
  
  ChannelSelector.prototype = {
    _observe: function() {
      var self = this;
      container.find("li a").click(function(event) {
        var anchor = $(this),
            href = anchor.attr("href"),
            // get the index of the element
            index = parseInt(href.match(REG_EXP_ELEMENT_INDEX)[1], 10),
            // get id of channel
            channelId = parseInt(href.match(REG_EXP_CHANNEL_ID)[1], 10);
        
        feedHolder.animate({
          left: index * -channelWidth
        }, "fast", function() {
          self.setCurrentChannelId(channelId);
          
          // trigger global notification
          $(protonet.globals.notifications).trigger("channel.changed", channelId);
        });
        
        container.find(".active").toggleClass("active");
        anchor.parent("li").toggleClass("active");
        anchor.find(".notification").remove();
        
        event.preventDefault();
      });
    },
    
    notify: function(channelId) {
      var anchor = $("#channel-" + channelId).find("li a"),
          notificationElement = anchor.find(".new-meeps");
      if (notificationElement.length == 0) {
        // title="5 new meeps in <%= c.name.capitalize %>" would be nice
        notificationElement = $("<sup />", { html: 0, className: "new-meeps" }).appendTo(anchor);
      }
      notificationElement.html(parseInt(notificationElement.html(), 10) + 1);
    },
    
    getCurrentChannelId: function() {
      return parseInt(channelInput.val(), 10);
    },
    
    setCurrentChannelId: function(id) {
      channelInput.val(id);
    }
  };
  
  return ChannelSelector;
})();
