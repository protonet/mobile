//= require "../utils/parse_query_string.js"
//= require "../behaviors/channels.js"
//= require "channel.js"
//= require "rendezvous.js"

/**
 * @events
 *    channels.data_available - Called when data is available and the class itself is initialized and ready
 *    channels.initialized    - Called when all channels are initialized and the data is available
 *    channel.change          - Invoked when user wants to switch to another channel (eg. by clicking on a channel link)
 *    channel.subscribe       - Call this when you want to subscribe a new channel by id
 */
protonet.timeline.Channels = {
  availableChannels: protonet.config.availableChannels || {},
  
  initialize: function() {
    this.container    = $("#timeline");
    this.tabContainer = $("#channels ul");
    this.tabs         = $("#channels [data-channel-id]");
    
    // All channel instances as key=>value
    this.channels             = {};
    this.channelsBeingLoaded  = {};
    this.rendezvous           = {};
    
    this.queryParams = protonet.utils.parseQueryString(protonet.utils.History.getCurrentPath());
  },
  
  render: function(data) {
    // All channel data as array
    this.data = data || [];
    
    this._updateSubscribedChannels();
    
    protonet.trigger("channels.data_available", [this.data, this.availableChannels, this.subscribedChannels]);
    
    this._observe();
    this._render();
  },
  
  getActive: function() {
    var activeChannels = $.map(this.tabs, function(tab) {
      return +$(tab).data("channel-id");
    });
    
    var urlChannelId = +this.queryParams.channel_id;
    if (urlChannelId) {
      activeChannels.push(urlChannelId);
    }
    
    var activeRendezvousChannels = Object.keys(localStorage.active_rendezvous ? JSON.parse(localStorage.active_rendezvous) : {});
    
    return activeChannels.concat(activeRendezvousChannels);
  },
  
  _updateSubscribedChannels: function() {
    this.subscribedChannels = $.map(this.data, function(channel) { return channel.id; });
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
      
      .bind("channels.change_to_first", function() {
        var firstChannel = this.data[0];
        if (firstChannel) {
          protonet.trigger("channel.change", this.data[0].id);
        }
      }.bind(this))
      
      .bind("channel.hide", function() {
        this.selected = null;
      }.bind(this))
      
      .bind("channel.load", function(e, data) {
        this.loadChannel(data.channel_id);
      }.bind(this))
      
      /**
       * Subscribe a new channel by id
       */
      .bind("channel.subscribe", function(e, id) {
        protonet.trigger("channel.hide").trigger("timeline.loading_start");
        
        var identifier = this.getChannelName(+id) || "#" + id;
        
        var success = function() {
          var message = protonet.t("CHANNEL_SUBSCRIPTION_SUCCESS", { identifier: identifier });
          protonet.trigger("flash_message.notice", message);
        };
        
        var error = function() {
          var message = protonet.t("CHANNEL_SUBSCRIPTION_ERROR", { identifier: identifier });
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
              data.already_subscribed ? protonet.trigger("channel.load", { channel_id: id }) : success();
            } else {
              error();
            }
          },
          error: error
        });
      }.bind(this))
      
      .bind("meep.receive", function(e, meepData) {
        if (this.channels[meepData.channel_id]) {
          return;
        }
        this.loadChannel(meepData.channel_id, meepData);
      }.bind(this))
      
      /**
       * Create a tab handle and render meeps for the newly subscribed channel
       */
      .bind("user.subscribed_channel", function(e, data) {
        var channelId = data.channel_id;
        if (protonet.config.user_id != data.user_id) {
          return;
        }
        this.loadChannel(channelId);
      }.bind(this))
      
      /**
       * Remove the tab handle, all meeps and all other dependencies of a channel
       */
      .bind("user.unsubscribed_channel", function(e, data) {
        var channelId = data.channel_id;
        if (protonet.config.user_id != data.user_id) {
          return;
        }
        
        this.unloadChannel(channelId);
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
     * Rendezvous
     */
    protonet
      .bind("rendezvous.start", function(e, partner) {
        if (!partner) {
          return;
        }
        
        if (protonet.config.user_id == partner) {
          protonet.trigger("flash_message.error", protonet.t("RENDEZVOUS_WITH_YOURSELF_ERROR"));
          return;
        }
        
        if (this.rendezvous[partner]) {
          protonet.trigger("timeline.loading_end").trigger("channel.change", this.rendezvous[partner].data.id);
        } else {
          protonet.trigger("channel.hide").trigger("timeline.loading_start");
          $.ajax("/users/" + partner + "/" + "start_rendezvous", {
            type: "POST",
            data: { authenticity_token: protonet.config.authenticity_token }
          });
        }
      }.bind(this));
    
    /**
     * Ajax history to enable forward and backward
     * buttons in browser to switch between channels
     */
    protonet.utils.History.onChange(this._selectChannel.bind(this));
  },
  
  _render: function() {
    this.data.chunk(function(channelData) {
      var channel = this._instantiateChannel(channelData).render(this.container);
      // Render tab if not existing
      if (channel.tab.length === 0) {
        channel.renderTab(this.tabContainer, true);
      }
    }.bind(this), function() {
      protonet.trigger("channels.initialized", [this.data]);
    }.bind(this));
  },
  
  _instantiateChannel: function(channelData) {
    var instance;
    if (channelData.rendezvous) {
      instance = new protonet.timeline.Rendezvous(channelData);
      this.rendezvous[channelData.rendezvous] = instance;
    } else {
      instance = new protonet.timeline.Channel(channelData);
    }
    return this.channels[channelData.id] = instance;
  },
  
  /**
   * Select channel based on url params
   * If no url params are given, we simply choose
   * the first channel in the data array
   */
  _selectChannel: function() {
    var urlChannelId      = +this.queryParams.channel_id,
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
  },
  
  /**
   * triggerMeepData is an optional parameter. it's a meep data object that triggered
   * the channel to load
   */
  loadChannel: function(channelId, triggerMeepData) {
    if (this.channels[channelId] || this.channelsBeingLoaded[channelId]) {
      return;
    }
    if (!this.selected) {
      protonet.trigger("timeline.loading_start");
    }
    
    var eventName                 = "meep.receive." + channelId,
        meepsReceivedWhileLoading = this.channelsBeingLoaded[channelId] = {};
    
    protonet.bind(eventName, function(e, meepData) {
      if (meepData.channel_id === channelId) {
        // queue them while the channel is being loaded
        meepsReceivedWhileLoading[meepData.id] = meepData;
      }
    });
    
    // queue the meep that triggered the channel to load
    if (triggerMeepData) {
      meepsReceivedWhileLoading[triggerMeepData.id] = triggerMeepData;
    }
    
    $.ajax({
      url: "/channels/" + channelId,
      success: function(data) {
        // Strip all meeps that were receive while the channel was loaded
        // Those meeps will later be rendered by firing the "meep.receive" event
        data.meeps = $.map(data.meeps, function(meepData) {
          return meepsReceivedWhileLoading[meepData.id] ? null : meepData; // returning null will remove it
        });
        
        this._instantiateChannel(data).renderTab(this.tabContainer).render(this.container);
        this.data.push(data);
        this._updateSubscribedChannels();
        
        if (!this.selected) {
          protonet.trigger("timeline.loading_end").trigger("channel.change", channelId);
        }
        
        protonet.unbind(eventName);
        $.each(meepsReceivedWhileLoading, function(id, meepData) {
          protonet.trigger("meep.receive", meepData);
        });
        
        delete this.channelsBeingLoaded[channelId];
      }.bind(this)
    });
  },
  
  unloadChannel: function(channelId) {
    if (!this.channels[channelId]) {
      return;
    }
    
    this.channels[channelId].destroy();
    
    delete this.rendezvous[this.channels[channelId].partner];
    delete this.channels[channelId];
    
    this.data = $.map(this.channels, function(instance) {
      return instance.data;
    });
    
    this._updateSubscribedChannels();
  }
};