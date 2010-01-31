protonet.controls.ChannelSelector = (function() {
  var container,
      feedHolder,
      REG_EXP_ELEMENT_INDEX = /index=([0-9]*)/,
      REG_EXP_CHANNEL_ID = /channel_id=([0-9]*)/;
  
  return function(args) {
    // get container
    container = $("#channel");
  
    // get feed-holder
    feedHolder = $("#feed-holder");
    
    // get all channel links and bind click
    container.find(".channel a").click(function() {
      var anchor = $(this);
      
      // get the index of the element
      var index = parseInt(anchor.attr("href").match(REG_EXP_ELEMENT_INDEX)[1], 10);
      // get id of channel
      var channelId = parseInt(anchor.attr("href").match(REG_EXP_CHANNEL_ID)[1], 10);
      
      feedHolder.animate({ left: index * -611 }, "fast");
      container.find(".active").toggleClass("active");
      anchor.parent("li").toggleClass("active");
      
      // set form channel_id to correct value
      args.parent_widget.input_channel_id.val(channelId);
      args.parent_widget.input_channel_id.trigger('change');
      
      return false;
    });
  };
})();
