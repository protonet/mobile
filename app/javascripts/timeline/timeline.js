/**
 * TODO (project: pre-timesquare):
 *  - endless scrolling
 *  - prevent scrolling when watching video in timeline
 *  - meep merging
 *  - grab selected channel from url
 *  - meep sending via ajax/dispatcher
 *  - channel notifications
 *  - documentation
 *  - remove slide logic/html
 */
protonet.timeline = {
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
    
    protonet.timeline.Channels.initialize(channelData);
  }
};

//= require "channels.js"