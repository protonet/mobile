//= require "meep.js"

protonet.controls.Channels.Channel = function(data, link, container, isSelected) {
  this.container  = container;
  this.link       = link;
  this.data       = data;
  this.$window    = $(window);
  this.isSelected = isSelected;
  this.subModules = {};
  
  this._observe();
};

protonet.controls.Channels.Channel.prototype = {
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
      
      var channelPositionTop = channel.offset().top,
          scrollPositionTop  = $window.scrollTop();
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
      this.isSelected ? this.link.addClass("active") : this.link.removeClass("active");
    }.bind(this));
  },
  
  render: function() {
    this.channelList = $("<ul />", {
      "class":            "meeps",
      "data-channel-id":  this.data.id
    }).appendTo(this.container).data({ channel: this.data, instance: this });
    
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
      new protonet.controls.Meep(meep).render(this.channelList);
    }.bind(this), function() {
      protonet.Notifications.trigger("channel.rendered", [this.channelList, this.data, this]);
    }.bind(this));
  }
};