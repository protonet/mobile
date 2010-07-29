//= require "meep.js"

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
 *    channel.changed   - Call this with the channel id if you want to switch the channel
 *    channel.rendered  - Triggered when channel, including meeps, is completely rendered
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
  MERGE_MEEPS_TIMEFRAME: 5 * 60 * 1000, // 5 minutes
  
  _observe: function() {
    /**
     * Render new meep in selected channel
     * when "meep.render" event is triggered
     */
    protonet.Notifications.bind("meep.render", function(e, meepDataOrForm, post) {
      if (!this.isSelected) {
        return;
      }
      this._renderMeep(meepDataOrForm, post);
    }.bind(this));
    
    /**
     * Store new meep in data obj
     */
    protonet.Notifications.bind("meep.rendered", function(e, meepElement, meepData, instance) {
      if (meepData.channel_id != this.data.id) {
        return;
      }
      
      this.lastMeep = instance;
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
   * Renders the channel list and decided whether the list is visible or not
   */
  render: function(container) {
    this.channelList = $("<ul />", {
      "class":            "meeps",
      "data-channel-id":  this.data.id
    }).appendTo(container).data({ channel: this.data, instance: this });
    
    this.toggle();
    
    this._renderMeeps(this.data.meeps);
    
    return this;
  },
  
  _renderMeeps: function(meepsData) {
    /**
     * Reverse meeps since we have to render them from top to bottom
     * in order to ensure that meep-merging works
     *
     * Chunking needed to avoid ui blocking while rendering
     */
    meepsData.reverse().chunk(function(meepData) {
      this._renderMeep(meepData);
    }.bind(this), function() {
      protonet.Notifications.trigger("channel.rendered", [this.channelList, this.data, this]);
    }.bind(this));
  },
  
  /**
   * Merge last and new meep when ...
   *  ... authors are the same
   *  ... the time difference between both is less than MERGE_MEEPS_TIMEFRAME
   *  ... the new meep hasn't got a text extension attached
   */
  _renderMeep: function(meepDataOrForm, post) {
    var meep          = new protonet.timeline.Meep(meepDataOrForm),
        newMeepData   = meep.data,
        lastMeepData  = this.lastMeep && this.lastMeep.data;
        
    if (lastMeepData
        && newMeepData.author == lastMeepData.author
        && !newMeepData.text_extension 
        && new Date(newMeepData.created_at) - new Date(lastMeepData.created_at) < this.MERGE_MEEPS_TIMEFRAME) {
      meep.mergeWith(this.lastMeep.element);
    } else {
      meep.render(this.channelList);
    }
    
    if (post) {
      meep.post();
    }
  }
};