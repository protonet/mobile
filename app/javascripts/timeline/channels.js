//= require "../utils/parse_query_string.js"
//= require "../behaviors/channels.js"
//= require "channel.js"
//= require "../lib/jquery.html5sortable.js"

/**
 * @events
 *    channels.data_available - Called when data is available and the class itself is initialized and ready
 *    channels.initialized    - Called when all channels are initialized and the data is available
 *    channel.change          - Invoked when user wants to switch to another channel (eg. by clicking on a channel link)
 *    channel.subscribe       - Call this when you want to subscribe a new channel by id
 */
protonet.timeline.Channels = {
  availableChannels: protonet.config.availableChannels || {},
  
  initialize: function(data) {
    this.container          = $("#timeline");
    this.channelLinks       = $("#channels li>a");
    this.data               = data || [];
    this.subscribedChannels = $.map(this.data, function(channel) { return channel.id; });
    
    protonet.trigger("channels.data_available", [this.data, this.availableChannels, this.subscribedChannels]);
    
	  this._makeChannelsSortable();
    this._observe();
    this._renderChannelLists();
  },
  

  _makeChannelsSortable: function() {
	  $('#channels ul').Html5Sortable({
	    drop: function( p_srcLine, p_targetLine ) {return true;},
	    dropend: function() {
	      var channel_array = []
        $("#channels ul a").each(
          function(i, channel){
            // var channel = {"channel_id": ($(channel).data("channel-id"))}; 
            // channel_array.push(channel);
            channel_array.push($(channel).data("channel-id"));
          }
        );  
	      
      $.ajax({
         url: "/channels/sort" ,
         type: "POST",
         data:     { "channel_order[]": channel_array},
         traditional: true
       });
      }
	  });
  },
  	
  _observe: function() {
    /**
     * Track selected channel
     * Sometimes we have to prevent the hash from changing
     * to avoid creating new browser history entries
     *
     * If the desired channel is not already subscribed this
     * will fire the channel.subscribe event
     */
    protonet.bind("channel.change", function(e, id, avoidHistoryChange) {
      id = +id; // + Makes sure that id is a Number
      if ($.inArray(id, this.subscribedChannels) == -1) {
        protonet.trigger("channel.subscribe", id);
        return;
      }
      
      this.selected = id;
      
      if (!avoidHistoryChange) {
        protonet.utils.History.register("?channel_id=" + id);
      }
    }.bind(this));
    
    /**
     * Select initial channel when channels are rendered/initialized
     */
    protonet.bind("channels.initialized", this._selectChannel.bind(this));
    
    /**
     * Subscribe a new channel by id
     */
    protonet.bind("channel.subscribe", function(e, id) {
      var error = function() {
        var identifier = this.getChannelName(+id) || id,
            message = protonet.t("CHANNEL_SUBSCRIPTION_ERROR").replace("{identifier}", identifier);
        protonet.trigger("flash_message.error", message);
      }.bind(this);
      
      $.ajax({
        type:   "post",
        url:    "/listens/",
        data:   {
          channel_id:         id,
          authenticity_token: protonet.config.authenticity_token
        },
        success: function(data) {
          if (data.success) {
            if (data.public_channel) {
              location.href = "?channel_id=" + id;
            } else {
              // Strip channel_id from URL
              location.href = location.href.substring(0, location.href.indexOf('?'));
            }
          } else {
            error();
          }
        },
        error: error
      });
    }.bind(this));
    
    /**
     * Logic for loading meeps that were send when the user was disconnected
     */
    protonet.bind("socket.reconnected", function(event) {
      var channelStates = {};
      $.each(this.data, function(i, channel) {
        var latestMeepData = channel.meeps[channel.meeps.length - 1];
        channelStates[channel.id] = latestMeepData ? latestMeepData.id : 0;
      });
      
      $.ajax({
        url:      "/tweets/sync",
        data:     { channel_states: channelStates },
        success: function(response) {
          $.each(response, function(channelId, meeps) {
            $.each(meeps, function(i, meepData) {
              protonet.trigger("meep.receive", [meepData]);
            });
          });
        }
      });
    }.bind(this));
    
    /**
     * Ajax history to enable forward and backward
     * buttons in browser to switch between channels
     */
    protonet.utils.History.onChange(this._selectChannel.bind(this));
  },
  
  _renderChannelLists: function() {
    this.data.chunk(function(channelData) {
      var link = this.channelLinks.filter("[data-channel-id='" + channelData.id + "']");
      new protonet.timeline.Channel(channelData, link).render(this.container);
    }.bind(this), function() {
      protonet.trigger("channels.initialized", [this.data]);
    }.bind(this));
  },
  
  /**
   * Select channel based on url params
   * If no url params are given, we simply choose
   * the first channel in the data array
   */
  _selectChannel: function() {
    var queryParams       = protonet.utils.parseQueryString(protonet.utils.History.getCurrentPath()),
        urlChannelId      = +queryParams.channel_id,
        selectedChannelId = urlChannelId || (this.data[0] ? this.data[0].id : null),
        alreadySelected   = this.selected == selectedChannelId;
    if (selectedChannelId && !alreadySelected) {
      protonet.trigger("channel.change", [selectedChannelId, true]);
    }
  },
  
  getChannelName: function(channelId) {
    var channelName;
    for (channelName in this.availableChannels) {
      if (this.availableChannels[channelName] == channelId) {
        return channelName;
      }
    }
    return null;
  }
};