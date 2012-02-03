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
      .on("timeline.loading_start", function() {
        $loadingIndicator.show();
      })
      .on("timeline.loading_end", function() {
        $loadingIndicator.hide();
      });
  },
  
  load: function() {
    protonet.trigger("timeline.loading_start");
    
    protonet.data.Channel.getAllByIds(protonet.timeline.Channels.getActive(), {
      success:  function(data) {
        protonet.timeline.Channels.render(data);
        protonet.trigger("timeline.loading_end");
      },
      error: function(xhr) {
        var isAborted = xhr.status === 0;
        if (!isAborted) {
          protonet.trigger("flash_message.error", protonet.t("LOADING_MEEPS_ERROR"));
        }
        protonet.trigger("timeline.loading_end");
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