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
    // All channel instances as key=>value
    this.channels           = {};
    // All channel data as array
    this.data               = data || [];
    
    this._updateSubscribedChannels();
    
    protonet.trigger("channels.data_available", [this.data, this.availableChannels, this.subscribedChannels]);
    
    this._makeChannelsSortable();
    this._observe();
    this._renderChannelLists();
  },
  
  _updateSubscribedChannels: function() {
    this.subscribedChannels = $.map(this.data, function(channel) { return channel.id; });
  },
  
  _makeChannelsSortable: function() {
    $("#channels ul").Html5Sortable({
      drop: function() {
        return true;
      },
      dropend: function() {
        var channelArray = $.map($("#channels ul a"), function(channel){
          return $(channel).data("channel-id");
        });
        $.ajax({
          url:      "/users/sort_channels" ,
          type:     "POST",
          data:     { "channel_order[]": channelArray, "id": protonet.config.user_id },
          traditional: true
        });
        protonet.trigger("channels.reordered");
      }
    });
  },
  
  _observe: function() {
    protonet
      /**
       * Track selected channel
       * Sometimes we have to prevent the hash from changing
       * to avoid creating new browser history entries
       *
       * If the desired channel is not already subscribed this
       * will fire the channel.subscribe event
       */
      .bind("channel.change", function(e, id, avoidHistoryChange) {
        id = +id; // + Makes sure that id is a Number
        if ($.inArray(id, this.subscribedChannels) == -1) {
          protonet.trigger("channel.subscribe", id);
          return;
        }
      
        this.selected = id;
      
        if (!avoidHistoryChange) {
          protonet.utils.History.register("?channel_id=" + id);
        }
      }.bind(this))
    
      /**
       * Select initial channel when channels are rendered/initialized
       */
     .bind("channels.initialized", this._selectChannel.bind(this))
      
      /**
       * Subscribe a new channel by id
       */
      .bind("channel.subscribe", function(e, id) {
        var identifier = this.getChannelName(+id) || "#" + id;
        
        var success = function() {
          var message = protonet.t("CHANNEL_SUBSCRIPTION_SUCCESS").replace("{identifier}", identifier);
          protonet.trigger("flash_message.notice", message);
        };
        
        var error = function() {
          var message = protonet.t("CHANNEL_SUBSCRIPTION_ERROR").replace("{identifier}", identifier);
          protonet.trigger("flash_message.error", message);
        };
        
        $.ajax({
          type:   "post",
          url:    "/listens",
          data:   {
            channel_id:         id,
            authenticity_token: protonet.config.authenticity_token
          },
          success: function(data) {
            if (data.success) {
              success();
            } else {
              error();
            }
          },
          error: error
        });
      }.bind(this))
      
      /**
       * Create a tab handle and render meeps for the newly subscribed channel
       */
      .bind("user.subscribed_channel", function(e, data) {
        var channelId = data.channel_id;
        if (protonet.config.user_id != data.user_id) {
          return;
        }
        protonet
          .trigger("channel.hide")
          .trigger("timeline.loading_start");
        $.ajax({
          url: "/channels/" + channelId,
          success: function(data) {
            this.data.push(data);
            this._updateSubscribedChannels();
            
            this.channels[channelId] = new protonet.timeline.Channel(data).renderTab("#channels ul").render(this.container);
            
            protonet
              .trigger("timeline.loading_end")
              .trigger("channel.change", channelId);
          }.bind(this)
        });
      }.bind(this))
      
      /**
       * Remove the tab handle, all meeps and all other dependencies of a channel
       */
      .bind("user.unsubscribed_channel", function(e, data) {
        var channelId = data.channel_id;
        
        if (protonet.config.user_id != data.user_id) {
          return;
        }
        
        if (!this.channels[channelId]) {
          return;
        }
        
        this.channels[channelId].destroy();
        delete this.channels[channelId];
        
        this.data = [];
        $.each(this.channels, function(id, instance) {
          this.data.push(instance.data);
        }.bind(this));
        
        this._updateSubscribedChannels();
      }.bind(this))
      
      /**
       * Logic for loading meeps that were send when the user was disconnected
       */
      .bind("socket.reconnected", function(event) {
        var channelStates = {};
        $.each(this.data, function(i, channel) {
          var latestMeepData = channel.meeps[channel.meeps.length - 1];
          channelStates[channel.id] = latestMeepData ? latestMeepData.id : 0;
        });
      
        $.ajax({
          url:      "/meeps/sync",
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
      this.channels[channelData.id] = new protonet.timeline.Channel(channelData).render(this.container);
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