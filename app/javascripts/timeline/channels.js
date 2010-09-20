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
     * If the desired channel is not already subscribed this
     * will fire the channel.subscribe event
     * 
     * Caution: Be sure that the passed id is always of typeof "number"
     * otherwise the comparsion with the already subscribed channel ids will
     * fail
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
    protonet.Notifications.bind("channels.initialized", this._selectChannel.bind(this));
    
    /**
     * Subscribe a new channel by id
     */
    protonet.Notifications.bind("channel.subscribe", function(e, id) {
      $.ajax({
        type:   "post",
        url:    "/listens/",
        data:   {
          channel_id:         id,
          authenticity_token: protonet.config.authenticity_token
        },
        success: function() { location.reload(); },
        error:   function() {
          var identifier = this.getChannelName(+id) || id,
              message = protonet.t("CHANNEL_SUBSCRIPTION_ERROR").replace("{identifier}", identifier);
          protonet.ui.FlashMessage.show("error", message);
        }.bind(this)
      });
    }.bind(this));
    
    /**
     * Ajax history to enable forward and backward
     * buttons in browser to switch between channels
     */
    $(window).bind("hashchange", this._selectChannel.bind(this));
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
  _selectChannel: function() {
    var hashParams        = protonet.utils.parseQueryString(location.hash.slice(1)),
        queryParams       = protonet.utils.parseQueryString(location.search.slice(1)),
        urlChannelId      = parseInt(hashParams.channel_id || queryParams.channel_id, 10),
        selectedChannelId = urlChannelId || (this.data[0] ? this.data[0].id : null);
    
    if (selectedChannelId && this.selected != selectedChannelId) {
      protonet.Notifications.trigger("channel.change", [selectedChannelId, true]);
    }
  },
  
  getChannelName: function(channelId) {
    for (var channelName in this.availableChannels) {
      if (this.availableChannels[channelName] == channelId) {
        return channelName;
      }
    }
  }
};