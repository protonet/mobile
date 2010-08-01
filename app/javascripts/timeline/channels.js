/**
 * @events
 *    channels.data_available - Called when data is available and the class itself is initialized and ready
 *    channels.rendered       - Called when all channels are rendered
 *    channel.change          - Invoked when user wants to switch to another channel (eg. by clicking on a channel link)
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
       
       protonet.Notifications.trigger("channel.change", id);
       
       event.preventDefault();
    }.bind(this));
    
    /**
     * Track selected channel
     */
    protonet.Notifications.bind("channel.change", function(e, id) {
      this.selected = id;
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
  }
};

//= require "channel.js"