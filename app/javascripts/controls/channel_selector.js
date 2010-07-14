//= require "../utils/add_slashes"

protonet.controls.ChannelSelector = function() {
  this.channelInput   = $("#tweet_channel_id");
  this.container      = $("#channel-selector");
  this.feedHolder     = $("#feed-holder");
  this.feedViewer     = $("#feed-viewer");
  this.channelWidth   = this.feedHolder.find("ul:first").outerWidth(true);
  
  this.channelsDowncaseMapping = {};
  this.channels                = [];
  
  $.each(protonet.globals.availableChannels, function(channelName, channelId){
    this.channelsDowncaseMapping[channelName.toLowerCase()] = channelName;
    this.channels.push(channelName);
  }.bind(this));
  
  this._observe();
  this._observeInStreamMentions();
  this._switchToAnchoredChannel();
  
  protonet.Notifications.trigger("channel.initialized", [this.channels]);
};

protonet.controls.ChannelSelector.prototype = {
  REG_EXP_CHANNEL_NAME: /channel_name=(.+)/,
  
  _observe: function() {
    /**
     * Disable user scrolling to prevent ugly bug in chrome/safari
     * where user can switch channels by marking text
     */
    this.feedViewer.scroll(function() {
      this.feedViewer.attr("scrollLeft", this.currentScrollLeft || 0);
    }.bind(this));
    
    this.container.delegate("li a", "click", function(event) {
      var anchor      = $(event.currentTarget),
          li          = anchor.parent("li"),
          index       = li.attr("data-channel-index"),
          channelId   = li.attr("data-channel-id"),
          channelName = li.attr("data-channel-name");
      
      this.feedHolder.animate({ left: index * -this.channelWidth }, "fast", function() {
        if (channelId == this.getCurrentChannelId()) {
          return;
        }
        
        this.currentScrollLeft = this.feedHolder.attr("scrollLeft");
        this.setCurrentChannelId(channelId);
        this.setCurrentChannelLocationHash(channelName);
        
        // trigger global notification
        protonet.Notifications.trigger("channel.changed", channelId);
      }.bind(this));
      
      this.container.find(".active").removeClass("active");
      li.addClass("active");
      anchor.find(".notification").remove();
      
      event.preventDefault();
    }.bind(this));
    
    protonet.Notifications.bind("message.new", function(e, message, channelId) {
      /**
       * Show a little badge on the channel when it's not focused
       */
      if (channelId != this.getCurrentChannelId()) {
        this.notify(channelId);
      }
    }.bind(this));
  },

  _observeInStreamMentions: function() {
    $("a.reply.channel").live("click", function(e){
      var channelName = this.channelsDowncaseMapping[$(e.currentTarget).text().toLowerCase()];
      location.hash = "channel_name=" + encodeURIComponent(channelName);
      this._switchToAnchoredChannel();
    }.bind(this));
  },

  _switchToAnchoredChannel: function() {
    var match = location.hash.match(this.REG_EXP_CHANNEL_NAME);
    if (match) {
      var channelName = decodeURIComponent(match[1]),
          channelLink = $("#channel li[data-channel-name='" + channelName + "'] > a");
      
      if (channelLink.length == 1) {
        channelLink.click();
      } else {
        $("<form />", {
          method: "post",
          action: "/listens/?channel_name=" + channelName
        }).hide().append($("<input />", {
          name: "authenticity_token",
          value: protonet.config.authenticity_token
        })).appendTo("body").submit();
      }
    }
  },

  notify: function(channelId) {
    var anchor = $("#channel-" + channelId).find("li a"),
        notificationElement = anchor.find(".new-meeps");
    if (notificationElement.length == 0) {
      notificationElement = $("<span />", { html: 0, className: "new-meeps" }).appendTo(anchor);
    }
    notificationElement.html(parseInt(notificationElement.html(), 10) + 1);
  },
  
  getCurrentChannelId: function() {
    return parseInt(this.channelInput.val(), 10);
  },
  
  setCurrentChannelId: function(id) {
    this.channelInput.val(id);
  },
  
  setCurrentChannelLocationHash: function(name) {
    location.hash = "channel_name=" + encodeURIComponent(name);
  }
};