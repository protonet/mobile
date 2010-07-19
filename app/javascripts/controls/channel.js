//= require "meep.js"

protonet.controls.Channels.Channel = function(data, link, container, isSelected) {
  this.container  = container;
  this.link       = link;
  this.data       = data;
  this.id         = data.id;
  this.isSelected = isSelected;
  this.subModules = {};
  
  this._observe();
};

protonet.controls.Channels.Channel.prototype = {
  _observe: function() {
    protonet.Notifications.bind("meep.sent", function(e, meepElement, meepData, instance) {
      this.subModules[meepData.id] = instance;
    }.bind(this));
    
    protonet.Notifications.bind("channel.changed", function(e, channelId) {
      this.isSelected = channelId == this.id;
      this.isSelected ? this.link.addClass("active") : this.link.removeClass("active");
    }.bind(this));
  },
  
  render: function() {
    this.channelList = $("<ul />", {
      "class":            "meeps",
      "data-channel-id":  this.id
    }).appendTo(this.container).data({ channel: this.data, instance: this });
    
    this.renderMeeps(this.data.meeps);
    
    return this;
  },
  
  renderMeeps: function(meeps) {
    /**
     * Reverse meeps since we have to render them from top to bottom
     * in order to ensure that meep-merging works
     *
     * Chunking needed to avoid ui blocking while rendering
     */
    meeps.reverse().chunk(function(meep) {
      this.subModules[meep.id] = new protonet.controls.Meep(meep).render(this.channelList);
    }.bind(this));
    
    return this;
  }
};