//= require "form/form.js"
//= require "channels.js"

$.extend(protonet.timeline, {
  initialize: function() {
    this._observe();
    this._initForm();
    this._initChannels();
    this.load();
  },
  
  _observe: function() {
    var $loadingIndicator = $("#timeline-loading");
    
    protonet
      .bind("timeline.loading_start", function() {
        $loadingIndicator.show();
      })
      .bind("timeline.loading_end", function() {
        $loadingIndicator.hide();
      });
  },
  
  load: function() {
    protonet.trigger("timeline.loading_start");
    
    $.ajax({
      url: "/",
      data: {
        // Dummy parameter to avoid weird caching/history issues in Firefox
        ajax:     1,
        channels: protonet.timeline.Channels.getActive().join(",")
      },
      success:  function(data) {
        protonet.timeline.Channels.render(data);
      },
      complete: function() {
        protonet.trigger("timeline.loading_end");
      },
      error: function() {
        protonet.trigger("flash_message.error", protonet.t("LOADING_MEEPS_ERROR"));
      }
    });
  },
  
  _initChannels: function(channelData) {
    protonet.timeline.Channels.initialize();
  },
  
  _initForm: function() {
    protonet.timeline.Form.initialize();
  }
});