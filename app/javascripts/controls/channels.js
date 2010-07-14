protonet.controls.Channels = {
  subModules: {},
  
  initialize: function(data) {
    this.container    = $("#feed-holder");
    this.channelLinks = $("#channels li");
    this.data         = data;
    this.selected     = parseInt(this.channelLinks.filter(".active").attr("data-channel-id"), 10);
    
    this._observe();
    this._renderChannelLists();
  },
  
  _observe: function() {
    this.channelLinks.live("click", function(event) {
      var id = $(event.currentTarget).attr("data-channel-id");
      
      this.select(id);
      
      event.preventDefault();
      event.stopPropagation();
    }.bind(this));
  },
  
  _renderChannelLists: function() {
    this.data.chunk(function(channelData) {
      var isSelected = this.selected == channelData,
          link       = this.channelLinks.filter("[data-channel-id=" + channelData.id + "]");
      this.subModules[channelData.id] = new this.Channel(channelData, link, this.container, isSelected);
    }.bind(this));
  },
  
  select: function(id) {
    this.selected = id;
    
    protonet.Notifications.trigger("channel.changed", id);
  },
  
  slideTo: function(id) {
    this.subModules[id].css("border", "1px red solid");
  },
  
  getDownCaseMapping: function() {
    var mapping = {};
    $(this.data).each(function(i, channelData) {
      mapping[channelData.name.toLowerCase()] = channelData.name;
    });
    return mapping;
  }
};

//= require "channel.js"