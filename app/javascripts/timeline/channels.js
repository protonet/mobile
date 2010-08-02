//= require "../utils/parse_query_string.js"
//= require "channel.js"

/**
 * @events
 *    channels.data_available - Called when data is available and the class itself is initialized and ready
 *    channels.initialized    - Called when all channels are initialized and the data is available
 *    channel.change          - Invoked when user wants to switch to another channel (eg. by clicking on a channel link)
 *    channel.subscribe       - Call this when you want to subscribe a new channel by id
 */
protonet.timeline.Channels = {
  initialize: function(data) {
    this.container          = $("#timeline");
    this.channelLinks       = $("#channels li>a");
    this.data               = data || [];
    this.availableChannels  = protonet.config.availableChannels || {};
    this.subscribedChannels = $.map(this.data, function(channel) { return channel.id; });
    
    protonet.Notifications.trigger("channels.data_available", [this.data, this.availableChannels, this.subscribedChannels]);
    
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
       var id = parseInt($(event.currentTarget).attr("data-channel-id"), 10);
       if (!id) {
         return;
       }
       
       protonet.Notifications.trigger("channel.change", id);
       event.preventDefault();
    }.bind(this));
    
    /**
     * Track selected channel
     * Sometimes we have to prevent the hash from changing
     * to avoid creating new browser history entries
     *
     * If the desired channel is not already subs
     */
    protonet.Notifications.bind("channel.change", function(e, id, avoidHashChange) {
      if ($.inArray(id, this.subscribedChannels) == -1) {
        protonet.Notifications.trigger("channel.subscribe", id);
        return;
      }
      
      this.selected = id;
      
      if (!avoidHashChange) {
        location.hash = "channel_id=" + id;
      }
    }.bind(this));
    
    /**
     * Select initial channel when channels are rendered/initialized
     */
    protonet.Notifications.bind("channels.initialized", function() {
      this._selectInitialChannel();
    }.bind(this));
    
    /**
     * Subscribe a new channel by id
     */
    protonet.Notifications.bind("channel.subscribe", function(e, id) {
      $("<form />", {
        method: "post",
        action: "/listens/?channel_id=" + id
      }).hide().append($("<input />", {
        name: "authenticity_token",
        value: protonet.config.authenticity_token
      })).appendTo("body").submit();
    });
    
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
      protonet.Notifications.trigger("channels.initialized", [this.data]);
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