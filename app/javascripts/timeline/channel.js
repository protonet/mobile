//= require "meep.js"
//= require "../lib/jquery.inview.js"

/**
 * @example
 *    // Render a new, unselected, channel into "#channel-container"
 *    var channelData = { id: 1, name: "Ali Schmali", meeps: [{ ... }, { ... }, ...] };
 *    new protonet.timeline.Channels.Channel(channelData, "#tab-link").render("#channel-container");
 *
 *    // Render a new, selected, channel into "#channel-container"
 *    new protonet.timeline.Channels.Channel(channelData, "#tab-link", true).render("#channel-container");
 *
 *  @events
 *    channel.changed       - Call this with the channel id if you want to switch the channel
 *    channel.rendered      - Triggered when channel, including meeps, is completely rendered
 *    channel.rendered_more - Triggered when a bunch of new meeps are rendered into the channel (due to endless scrolling, etc.)
 *
 */
protonet.timeline.Channels.Channel = function(data, link, isSelected) {
  this.link       = $(link);
  this.data       = data;
  this.$window    = $(window);
  this.isSelected = isSelected;
  this.lastMeep   = null;
  this.subModules = {};
  
  this._observe();
};

protonet.timeline.Channels.Channel.prototype = {
  config: {
    MERGE_MEEPS_TIMEFRAME: 2 * 60 * 1000, // 2 minutes
    FETCH_MEEPS_URL: "/tweets"
  },
  
  _observe: function() {
    /**
     * Render new meep in selected channel
     * when "meep.render" event is triggered
     */
    protonet.Notifications.bind("meep.render", function(e, meepDataOrForm, post) {
      if (!this.isSelected) {
        return;
      }
      
      this._renderMeep(meepDataOrForm, this.channelList, post);
    }.bind(this));
    
    /**
     * Store new meep in data obj
     */
    protonet.Notifications.bind("meep.rendered", function(e, meepElement, meepData, instance) {
      if (meepData.channel_id != this.data.id) {
        return;
      }
      
      this.latestMeep = instance;
      this.subModules[meepData.id] = instance;
    }.bind(this));
    
    /**
     * Set fixed scroll position when user scrolled down in timeline
     * (eg. to watch a video) while new meep occurs
     */
    protonet.Notifications.bind("meep.rendered", function(e, meepElement, meepData, instance) {
      if (meepData.channel_id != this.data.id) {
        return;
      }
      
      var channelPositionTop = this.channelList.offset().top,
          scrollPositionTop  = this.$window.scrollTop();
          offset             = 40;
      
      if (scrollPositionTop > (channelPositionTop + offset)) {
        var meepHeight = meepElement.outerHeight(true);
        this.$window.scrollTop(scrollPositionTop + meepHeight);
      }
    }.bind(this));
    
    /**
     * Set tab to active and store state
     */
    protonet.Notifications.bind("channel.changed", function(e, channelId) {
      this.isSelected = channelId == this.data.id;
      this.toggle();
    }.bind(this));
    
    /**
     * Init endless scroller when meeps are rendered
     */
    protonet.Notifications.bind("channel.rendered channel.rendered_more", function(e, channelList, data, instance) {
      if (instance != this) {
        return;
      }
      
      this._initEndlessScroller();
    }.bind(this));
  },
  
  toggle: function() {
    if (this.isSelected) {
      this.channelList.show();
      this.link.addClass("active");
    } else {
      this.channelList.hide();
      this.link.removeClass("active");
    }
    
    return this;
  },
  
  /**
   * Renders the channel list and decides whether the list is visible or not
   */
  render: function(container) {
    this.channelList = $("<ul />", {
      "class":            "meeps",
      "data-channel-id":  this.data.id
    }).appendTo(container).data({ channel: this.data, instance: this });
    
    this.toggle();
    
    this._renderMeeps(this.data.meeps, this.channelList, function() {
      protonet.Notifications.trigger("channel.rendered", [this.channelList, this.data, this]);
    }.bind(this));
    
    return this;
  },
  
  /**
   * Render meeps non-blocking into the given dom element
   */
  _renderMeeps: function(meepsData, channelList, callback) {
    /**
     * Reverse meeps since we have to render them from top to bottom
     * in order to ensure that meep-merging works
     *
     * Chunking needed to avoid ui blocking while rendering
     */
    meepsData.reverse().chunk(function(meepData) {
      this._renderMeep(meepData, channelList);
    }.bind(this), callback);
  },
  
  /**
   * Call this method if you want to
   * render older meeps into the channel list
   */
  _renderMoreMeeps: function(meepsData) {
    var tempContainer = $("<ul />");
    this._renderMeeps(meepsData, tempContainer, function() {
      this.channelList.append(tempContainer.children());
      protonet.Notifications.trigger("channel.rendered_more", [this.channelList, this.data, this]);
    }.bind(this));
  },
  
  /**
   * Renders a meep into the given channelList
   * If you want the meep to be sent to the server
   * pass post = true
   */
  _renderMeep: function(meepDataOrForm, channelList, post) {
    var meep              = new protonet.timeline.Meep(meepDataOrForm),
        newMeepData       = meep.data,
        previousMeep      = this.latestMeep,
        previousMeepData  = previousMeep && previousMeep.data;
    
    if (previousMeepData && this._shouldBeMerged(previousMeepData, newMeepData)) {
      meep.mergeWith(previousMeep.element);
    } else {
      meep.render(channelList);
    }
    
    if (post) {
      meep.post();
    }
  },
  
  /**
   * Load meeps for channel
   */
  _loadMeeps: function(parameters, callback) {
    protonet.Notifications.trigger("timeline.loading_start");
    
    $.extend(parameters, { channel_id: this.data.id });
    $.ajax({
      url:  this.config.FETCH_MEEPS_URL,
      type: "get",
      data: parameters,
      success: function(response) {
        if (!response || !response.length) {
          return;
        }
        
        (callback || $.noop)(response);
      },
      complete: function() {
        protonet.Notifications.trigger("timeline.loading_end");
      }
    });
  },
  
  /**
   * Provide this method with two meep data objects
   * and it will tell you whether they should be merged
   *
   * Merge previous and new meep when ...
   *  ... authors are the same
   *  ... the time difference between both is less than MERGE_MEEPS_TIMEFRAME
   *  ... the new meep hasn't got a text extension attached
   */
  _shouldBeMerged: function(previousMeepData, newMeepData) {
    return !newMeepData.text_extension &&
      newMeepData.author == previousMeepData.author &&
      new Date(newMeepData.created_at) - new Date(previousMeepData.created_at) < this.config.MERGE_MEEPS_TIMEFRAME;
  },
  
  /**
   * Load more meeps when last meep in list is visible
   * in the browser's viewport
   */
  _initEndlessScroller: function() {
    var lastMeepInList = this.channelList.children(":last").addClass("separator");
    
    lastMeepInList.bind("inview", function(event) {
      lastMeepInList.unbind("inview");
      var lastMeepId = lastMeepInList.data("meep").id;
      this._loadMeeps({ last_id: lastMeepId }, this._renderMoreMeeps.bind(this));
    }.bind(this));
  }
};