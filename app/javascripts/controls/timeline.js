//= require "channels.js"

protonet.controls.Timeline = {
  initialize: function() {
    this.load();
  },
  
  /**
   * TODO: Add failure handling to ajax request
   */
  load: function() {
    $.ajax({
      url: "/",
      success: this._initChannels.bind(this)
    });
  },
  
  _initChannels: function(channelData) {
    this.data = channelData;
    protonet.controls.Channels.initialize(channelData);
  }
};