//= require "meep.js"

protonet.controls.Meeps = {
  initialize: function() {
    this.feedHolder = $("#feed-holder");
    this.load();
  },
  
  /**
   * TODO: Add failure handling to ajax request
   */
  load: function() {
    $.ajax({
      url: "/",
      success: this.renderChannelList.bind(this)
    });
  },
  
  renderChannelList: function(channelData) {
    var channelListTemplate = $("<ul />", { className: "meeps" });
    $.each(channelData, function(i, channel) {
      var channelList = channelListTemplate.clone();
      channelList
        .attr("data-channel-content", channel.id)
        .appendTo(this.feedHolder);
      
      this.renderChannelMeeps(channelList, channel.meeps);
    }.bind(this));
  },
  
  renderChannelMeeps: function(channelList, meepData) {
    meepData.reverse();
    meepData.chunk(function(meep) {
      new protonet.controls.Meep(meep).render(channelList);
    });
  }
};
