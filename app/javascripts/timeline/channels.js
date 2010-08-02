//= require "../utils/parse_query_string.js"
//= require "channel.js"

/**
 * @events
 *    channels.data_available - Called when data is available and the class itself is initialized and ready
 *    channels.rendered       - Called when all channels are rendered
 *    channel.change          - Invoked when user wants to switch to another channel (eg. by clicking on a channel link)
 */
protonet.timeline.Channels = {
  initialize: function(data) {
    this.container          = $("#timeline");
    this.channelLinks       = $("#channels li>a");
    this.data               = data || [];
    this.availableChannels  = protonet.config.availableChannels || {};
    this.installedChannels  = $.map(this.data, function(channel) { return channel.name; });
    
    protonet.Notifications.trigger("channels.data_available", [this.data, this.availableChannels, this.installedChannels]);
    
    protonet.text_extensions.initialize(this.selected);
    protonet.controls.PrettyDate.initialize();
    
    this._observe();
    this._renderChannelLists();
  },
  
  _observe: function() {
    /**
     * Observe click on elements with data attribute
     * such as tab links and in-timeline channel replies
     */
    $(document).delegate("a[data-channel-id]", "click",  function(event) {
       var id = $(event.currentTarget).attr("data-channel-id");
       
       protonet.Notifications.trigger("channel.change", id);
       
       event.preventDefault();
    }.bind(this));
    
    /**
     * Track selected channel
     */
    protonet.Notifications.bind("channel.change", function(e, id, avoidHashChange) {
      this.selected = id;
      if (!avoidHashChange) {
        location.hash = "channel_id=" + id;
      }
    }.bind(this));
    
    /**
     * Select initial channel when channels are rendered/initialized
     */
    protonet.Notifications.bind("channels.rendered", function(e) {
      this._selectInitialChannel();
    }.bind(this));
    
    /**
     * Ajax history to enable forward and backward
     * buttons in browser to switch between channels
     */
    $(window).bind("hashchange", function() {
      var hashParams = protonet.utils.parseQueryString(location.hash.slice(1)),
          channelId  = parseInt(hashParams.channel_id, 10);
      if (channelId && channelId != this.selected) {
        protonet.Notifications.trigger("channel.change", [channelId, true]);
      }
    });
  },
  
  _renderChannelLists: function() {
    this.data.chunk(function(channelData) {
      var link       = this.channelLinks.filter("[data-channel-id=" + channelData.id + "]");
      new protonet.timeline.Channel(channelData, link).render(this.container);
    }.bind(this), function() {
      protonet.Notifications.trigger("channels.rendered", [this.data]);
    }.bind(this));
  },
  
  /**
   * Select channel based on url params
   * If no url params are given, we simply choose
   * the first channel in the data array
   */
  _selectInitialChannel: function() {
    var hashParams    = protonet.utils.parseQueryString(location.hash.slice(1)),
        queryParams   = protonet.utils.parseQueryString(location.search.slice(1)),
        urlChannelId  =  parseInt(hashParams.channel_id || queryParams.channel_id, 10);
    
    if (urlChannelId) {
      protonet.Notifications.trigger("channel.change", [urlChannelId, true]);
    } else if (this.data.length) {
      protonet.Notifications.trigger("channel.change", [this.data[0].id, true]);
    }
  }
};