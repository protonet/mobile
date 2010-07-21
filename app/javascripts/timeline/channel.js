//= require "meep.js"

protonet.timeline.Channels.Channel = function(data, link, isSelected) {
  this.link       = link;
  this.data       = data;
  this.$window    = $(window);
  this.isSelected = isSelected;
  this.subModules = {};
  
  this._observe();
};

protonet.timeline.Channels.Channel.prototype = {
  _observe: function() {
    /**
     * Store new meep in data obj
     */
    protonet.Notifications.bind("meep.rendered", function(e, meepElement, meepData, instance) {
      this.subModules[meepData.id] = instance;
    }.bind(this));
    
    /**
     * Set fixed scroll position when user scrolled down in timeline
     * (eg. to watch a video) while new meep occurs
     */
    protonet.Notifications.bind("meep.rendered", function(e, meepElement) {
      if (!this.isSelected) {
        return;
      }
      
      var channelPositionTop = this.channelList.offset().top,
          scrollPositionTop  = this.$window.scrollTop();
          offset             = 40;
      if (scrollPositionTop > (channelPositionTop + offset)) {
        var meepHeight = meepElement.outerHeight(true);
        $window.scrollTop(scrollPositionTop + meepHeight);
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
  
  render: function(container) {
    this.channelList = $("<ul />", {
      "class":            "meeps",
      "data-channel-id":  this.data.id
    }).appendTo(container).data({ channel: this.data, instance: this });
    
    this.toggle();
    
    this._renderMeeps(this.data.meeps);
    
    return this;
  },
  
  _renderMeeps: function(meeps) {
    /**
     * Reverse meeps since we have to render them from top to bottom
     * in order to ensure that meep-merging works
     *
     * Chunking needed to avoid ui blocking while rendering
     */
    meeps.reverse().chunk(function(meep) {
      new protonet.timeline.Meep(meep).render(this.channelList);
    }.bind(this), function() {
      protonet.Notifications.trigger("channel.rendered", [this.channelList, this.data, this]);
    }.bind(this));
  }
};