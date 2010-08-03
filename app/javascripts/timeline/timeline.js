/**
 * TODO (project: pre-timesquare):
 *  - endless scrolling
 *  - prevent scrolling when watching video in timeline
 *  - meep merging
 *  - grab selected channel from url
 *  - meep sending via ajax/dispatcher
 *  - channel notifications
 *  - documentation
 *  - remove slide logic/html -done
 */
protonet.timeline = {
  initialize: function() {
    this.loadingIndicator = $("#timeline-loading-indicator");
    
    this._observe();
    this._initForm();
    this.load();
  },
  
  _observe: function() {
    protonet.Notifications.bind("timeline.loading_start", function() {
      this.loadingIndicator.show();
    }.bind(this));
    
    protonet.Notifications.bind("timeline.loading_end", function() {
      this.loadingIndicator.hide();
    }.bind(this));
  },
  
  /**
   * TODO: Add failure handling to ajax request
   */
  load: function() {
    protonet.Notifications.trigger("timeline.loading_start");
    
    $.ajax({
      url: "/",
      success: this._initChannels.bind(this),
      complete: function() {
        protonet.Notifications.trigger("timeline.loading_end");
      }
    });
  },
  
  _initChannels: function(channelData) {
    this.data = channelData;
    
    protonet.timeline.Channels.initialize(channelData);
  },
  
  _initForm: function() {
    protonet.timeline.Form.initialize();
  }
};

//= require "form.js"
//= require "channels.js"