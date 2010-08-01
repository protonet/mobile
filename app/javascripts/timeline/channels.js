/**
 * @events
 *    channels.data_available - Called when data is available and the class itself is initialized and ready
 *    channels.rendered       - Called when all channels are rendered
 */
protonet.timeline.Channels = {
  initialize: function(data) {
    this.container        = $("#timeline");
    this.channelLinks     = $("#channels li");
    this.data             = data;
    this.selected         = parseInt(this.channelLinks.filter(".active").attr("data-channel-id"), 10);
    
    protonet.Notifications.trigger("channels.data_available", [this.data]);
    
    protonet.text_extensions.initialize(this.selected);
    protonet.controls.PrettyDate.initialize();
    
    this._observe();
    this._renderChannelLists();
  },
  
  _observe: function() {
    /**
     * Observe click on elements with data attribute
     * such as tab links and in-timeline channel replies
     */
    $(document).delegate("li[data-channel-id], a[data-channel-id]", "click",  function(event) {
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
      protonet.Notifications.trigger("channels.rendered", [this.data]);
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