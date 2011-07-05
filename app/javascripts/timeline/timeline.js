protonet.timeline = {
  initialize: function() {
    this._observe();
    this._initForm();
    this.load();
  },
  
  _observe: function() {
    var loadingIndicator = $("#timeline-loading-indicator");
    
    protonet.bind("timeline.loading_start", function() {
      loadingIndicator.show();
    });
    
    protonet.bind("timeline.loading_end", function() {
      loadingIndicator.hide();
    });
  },
  
  load: function() {
    protonet.trigger("timeline.loading_start");
    
    $.ajax({
      url: "/",
       /**
        * Dummy parameter needed to avoid weird caching/history issues in Firefox
        */
      data: { ajax: 1 },
      success: this._initChannels.bind(this),
      complete: function() {
        protonet.trigger("timeline.loading_end");
      },
      error: function() {
        protonet.trigger("flash_message.error", protonet.t("LOADING_MEEPS_ERROR"));
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

//= require "form/form.js"
//= require "channels.js"