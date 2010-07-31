protonet.timeline.Channels = {
  initialize: function(data) {
    this.container        = $("#timeline");
    this.channelLinks     = $("#channels li");
    this.data             = data;
    this.selected         = parseInt(this.channelLinks.filter(".active").attr("data-channel-id"), 10);
    
    protonet.text_extensions.initialize(this.selected);
    protonet.controls.PrettyDate.initialize();
    
    this._observe();
    this._renderChannelLists();
  },
  
  _observe: function() {
    this.channelLinks.live("click", function(event) {
      var id = $(event.currentTarget).attr("data-channel-id");
      
      this.select(id);
      
      event.preventDefault();
    }.bind(this));
  },
  
  _renderChannelLists: function() {
    this.data.chunk(function(channelData) {
      var isSelected = this.selected == channelData.id,
          link       = this.channelLinks.filter("[data-channel-id=" + channelData.id + "]");
      new this.Channel(channelData, link, isSelected).render(this.container);
    }.bind(this), function() {
      protonet.Notifications.trigger("channels.initialized", this.data);
    }.bind(this));
  },
  
  select: function(id) {
    this.selected = id;
    
    protonet.Notifications.trigger("channel.changed", id);
  },
  
  /**
   * TODO:
   *    This should be handled via event notifications
   */
  getDownCaseMapping: function() {
    var mapping = {};
    $(this.data).each(function(i, channelData) {
      mapping[channelData.name.toLowerCase()] = channelData.name;
    });
    return mapping;
  }
};

//= require "channel.js"