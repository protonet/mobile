//= require "../utils/parse_query_string.js"
//= require "../utils/browser_title.js"
//= require "../utils/is_window_focused.js"
//= require "../utils/url_behaviors.js"
//= require "../utils/get_channel_name.js"
//= require "channel.js"
//= require "rendezvous.js"
//= require "remote_channel.js"

/**
 * @events
 *    channels.data_available - Called when data is available and the class itself is initialized and ready
 *    channels.initialized    - Called when all channels are initialized and the data is available
 *    channel.change          - Invoked when user wants to switch to another channel (eg. by clicking on a channel link)
 */
protonet.timeline.Channels = {
  availableChannels: protonet.config.channel_name_to_id_mapping || {},
  
  initialize: function() {
    this.container    = $("#timeline");
    this.tabContainer = $("#channels ul");
    this.tabs         = $("#channels [data-channel-id]");
    
    // All channel instances as key=>value
    this.data                 = [];
    this.channels             = {};
    this.channelsBeingLoaded  = {};
    this.rendezvous           = {};
    
    /**
     * Ajax history to enable forward and backward
     * buttons in browser to switch between channels
     */
    protonet.utils.History.addHook(function() {
      if (location.pathname === "/") {
        this._selectChannel();
        return true;
      }
    }.bind(this));
  },
  
  render: function(data) {
    // All channel data as array
    this._prepareData(data);
    
    this._updateSubscribedChannels();
    
    protonet.trigger("channels.data_available", this.data, this.availableChannels, this.subscribedChannels);
    
    this._observe();
    this._render();
  },
  
  getActive: function() {
    var activeChannels = $.map(this.tabs, function(tab) {
      return +$(tab).data("channel-id");
    });
    
    var urlChannelId = +protonet.utils.parseQueryString(location.search).channel_id;
    if (urlChannelId) {
      activeChannels.push(urlChannelId);
    }
    
    var activeRendezvousChannels = Object.keys(protonet.storage.get("active_rendezvous") || {});
    
    return activeChannels.concat(activeRendezvousChannels);
  },
  
  _updateSubscribedChannels: function() {
    this.subscribedChannels = $.map(this.data, function(channel) { return channel.id; });
  },
  
  _observe: function() {
    $.behaviors({
      "a[data-channel-id]:click": function(element, event) {
        var $element      = $(element),
            id            = $element.data("channel-id"),
            isSubscribed  = $.inArray(id, this.subscribedChannels) !== -1;
        
        if (isSubscribed) {
          protonet.trigger("modal_window.hide").trigger("channel.change", id);
        } else if (protonet.config.allow_modal_views) {
          protonet.open("/channels/" + id);
        }
        
        event.preventDefault();
      }.bind(this),
      
      "a[data-meep-share]:click": function(element, event) {
        protonet
          .trigger("form.share_meep", $(element).data("meep-share"))
          .trigger("modal_window.hide");
        event.preventDefault();
      },
      
      "a[data-rendezvous-with]:click": function(element, event) {
        protonet
          .trigger("rendezvous.start", $(element).data("rendezvous-with"))
          .trigger("modal_window.hide");
        event.preventDefault();
      }
    });
    
    protonet
      /**
       * Track selected channel
       * Sometimes we have to prevent the hash from changing
       * to avoid creating new browser history entries
       */
      .on("channel.change", function(id, avoidHistoryChange) {
        avoidHistoryChange = avoidHistoryChange || protonet.ui.ModalWindow.isVisible();
        id = +id; // + Makes sure that id is a Number
        if (this.selected === id) {
          return;
        }
        
        if ($.inArray(id, this.subscribedChannels) === -1) {
          return;
        }
        
        this.selected = id;
        
        if (!avoidHistoryChange) {
          protonet.utils.History.push("/?channel_id=" + id);
        }
      }.bind(this))
      
      /**
       * Select initial channel when channels are rendered/initialized
       */
      .on("channels.initialized", this._selectChannel.bind(this))
      
      /**
       * Start rendezvous if param in url is given
       */
      .on("channels.initialized", function() {
        protonet.utils.urlBehaviors({ "rendezvous.start": /(?:\?|&)rendezvous_with=([^&#$]+)(.*)/ });
      })
      
      .on("channels.change_to_first", function() {
        var firstChannel = this.tabs.eq(0);
        if (firstChannel.length) {
          protonet.trigger("channel.change", firstChannel.data("channel-id"));
        }
      }.bind(this))
      
      .on("channel.hide", function() {
        this.selected = null;
      }.bind(this))
      
      .on("channel.load", function(data) {
        this.loadChannel(data.channel_id);
      }.bind(this))
      
      /**
       * Subscribe a new channel by id
       */
      .on("channel.subscribe", function(id) {
        protonet.trigger("channel.hide").trigger("timeline.loading_start");
        
        var identifier = protonet.utils.getChannelName(id) || "#" + id;
        
        var success = function() {
          var message = protonet.t("CHANNEL_SUBSCRIPTION_SUCCESS", { identifier: identifier });
          protonet.trigger("flash_message.notice", message);
        };
        
        var error = function() {
          var message = protonet.t("CHANNEL_SUBSCRIPTION_ERROR", { identifier: identifier });
          protonet.trigger("flash_message.error", message).trigger("timeline.loading_end");
        };
        
        $.ajax({
          type:     "post",
          dataType: "json",
          url:      "/listens",
          data:     { channel_id: id, },
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
      
      .on("meep.receive", function(meepData) {
        if (this.channels[meepData.channel_id]) {
          return;
        }
        this.loadChannel(meepData.channel_id, meepData);
      }.bind(this))
      
      /**
       * Create a tab handle and render meeps for the newly subscribed channel
       */
      .on("user.subscribed_channel", function(data) {
        var channelId = data.channel_id;
        if (protonet.config.user_id != data.user_id) {
          return;
        }
        this.loadChannel(channelId);
      }.bind(this))
      
      /**
       * Remove the tab handle, all meeps and all other dependencies of a channel
       */
      .on("user.unsubscribed_channel", function(data) {
        var channelId = data.channel_id;
        if (protonet.config.user_id != data.user_id) {
          return;
        }
        
        this.unloadChannel(channelId);
      }.bind(this))
      
      /**
       * Logic for loading meeps that were send when the user was disconnected
       */
      .on("socket.reconnected", function() {
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
                protonet.trigger("meep.receive", meepData);
              });
            });
          }
        });
      }.bind(this))
    
      /**
       * Rendezvous
       */
      .on("rendezvous.start", function(partner) {
        if (!partner) {
          return;
        }
        
        if (protonet.config.user_id == partner) {
          protonet.trigger("flash_message.error", protonet.t("RENDEZVOUS_WITH_YOURSELF_ERROR"));
          return;
        }
        
        var rendezvousKey = [partner, protonet.config.user_id].sort(function(a, b) { return a>b; }).join(":"),
            rendezvous    = this.rendezvous[rendezvousKey];
        if (rendezvous) {
          protonet.trigger("timeline.loading_end").trigger("channel.change", rendezvous.data.id);
        } else {
          protonet.trigger("channel.hide").trigger("timeline.loading_start");
          $.ajax("/users/" + partner + "/" + "start_rendezvous", {
            type: "post",
            error: function() {
              protonet.trigger("flash_message.error", protonet.t("RENDEZVOUS_ERROR")).trigger("timeline.loading_end");
            }
          });
        }
      }.bind(this));
    
    $(window).bind("beforeunload", function() {
      var lastReadMeeps = this._collectLastReadMeeps();
      protonet.storage.set("last_read_meeps", lastReadMeeps);
      
      $.ajax({
        async:  false,
        url:    "/users/update_last_read_meeps",
        type:   "PUT",
        data:   {
          id:      protonet.config.user_id,
          mapping: lastReadMeeps
        }
      });
    }.bind(this));
      
    setInterval(function() {
      var totalUnreadMeeps = 0;
      $.each(this.channels, function(id, channel) {
        totalUnreadMeeps += channel.unreadMeeps || 0;
      });
      
      if (totalUnreadMeeps) {
        protonet.utils.BrowserTitle.setPrefix(totalUnreadMeeps);
      } else {
        protonet.utils.BrowserTitle.restore();
      }
    }.bind(this), 1000);
    
    setInterval(function() {
      protonet.storage.set("last_read_meeps", this._collectLastReadMeeps());
    }.bind(this), 10000);
  },
  
  _render: function() {
    this.data.chunk(function(channelData) {
      var channel = this._instantiateChannel(channelData).render(this.container);
      // Render tab if not existing
      if (channel.tab.length === 0) {
        channel.renderTab(this.tabContainer, true);
      }
    }.bind(this), function() {
      protonet.trigger("channels.initialized", this.data, this.channels);
    }.bind(this));
  },
  
  _instantiateChannel: function(channelData) {
    var instance;
    if (channelData.rendezvous) {
      instance = new protonet.timeline.Rendezvous(channelData);
      this.rendezvous[channelData.rendezvous] = instance;
    } else if (channelData.global) {
      instance = new protonet.timeline.RemoteChannel(channelData);
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
    var urlChannelId      = +protonet.utils.parseQueryString(location.search).channel_id,
        selectedChannelId = urlChannelId || this.tabs.eq(0).data("channel-id");
    if (selectedChannelId) {
      protonet.trigger("channel.change", selectedChannelId, true);
    }
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
    
    var meepsReceivedWhileLoading = this.channelsBeingLoaded[channelId] = {},
        meepReceiveCallback       = function(meepData) {
          if (meepData.channel_id === channelId) {
            // queue them while the channel is being loaded
            meepsReceivedWhileLoading[meepData.id] = meepData;
          }
        };
    
    protonet.on("meep.receive", meepReceiveCallback);
    
    // queue the meep that triggered the channel to load
    if (triggerMeepData) {
      meepsReceivedWhileLoading[triggerMeepData.id] = triggerMeepData;
    }
    
    $.ajax({
      dataType: "json",
      url: "/channels/" + channelId,
      success: function(data) {
        // Strip all meeps that were receive while the channel was loaded
        // Those meeps will later be rendered by firing the "meep.receive" event
        data.meeps = $.map(data.meeps, function(meepData) {
          return meepsReceivedWhileLoading[meepData.id] ? null : meepData; // returning null will remove it
        });
        
        this._instantiateChannel(data).renderTab(this.tabContainer).render(this.container);
        this.tabs = $("#channels [data-channel-id]");
        this.data.push(data);
        this._updateSubscribedChannels();
        
        protonet.trigger("timeline.loading_end");
        if (!this.selected) {
          protonet.trigger("channel.change", channelId);
        }
        
        protonet.off("meep.receive", meepReceiveCallback);
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
    
    delete this.rendezvous[this.channels[channelId].data.rendezvous];
    delete this.channels[channelId];
    
    this.data = $.map(this.channels, function(instance) {
      return instance.data;
    });
    
    this._updateSubscribedChannels();
    
    if (this.selected === channelId) {
      protonet.trigger("channels.change_to_first");
    }
  },
  
  _collectLastReadMeeps: function() {
    var mapping = {};
    $.each(this.data, function(i, channelData) {
      if (channelData.last_read_meep) {
        mapping[channelData.listen_id] = channelData.last_read_meep;
      }
    });
    return mapping;
  },
  
  /**
   * Sync last read meeps from local storage into data object
   */
  _prepareData: function(data) {
    this.data = data || [];
    var lastReadMeeps = protonet.storage.get("last_read_meeps") || {};
    $.each(this.data, function(i, channelData) {
      channelData.last_read_meep = Math.max(+lastReadMeeps[channelData.listen_id] || 0, channelData.last_read_meep);
    });
  }
};