//= require "../utils/add_slashes"

protonet.controls.ChannelSelector = (function() {
  var container,
      channelWidth,
      feedHolder,
      channelInput,
      REG_EXP_ELEMENT_INDEX = /index=(\d*)/,
      REG_EXP_CHANNEL_ID = /channel_id=(\d*)/;
  
  function ChannelSelector(params) {
    channelInput = params.channel_input;
    
    container = container || $("#channel");
    feedHolder = feedHolder || $("#feed-holder");
    channelWidth = channelWidth || $("#feed-holder").find("ul:first").outerWidth(true);

    this.channelsDowncaseMapping = {};
    this.channels = container.find("li.channel a").map(function(e){
      var channelName = $(this).attr("title");
      this.channelsDowncaseMapping[channelName.toLowerCase()] = channelName;
      return channelName;
    });
    
    if (protonet.globals.inputConsole) {
      protonet.globals.inputConsole.initAutocompleter(this.channels);
    }

    this._observe();
    this._observeInStreamMentions();
    this._switchToAnchoredChannel();
  }
  
  ChannelSelector.prototype = {

    _observe: function() {
      container.find(".channel a").click(function(event) {
        var anchor = $(event.currentTarget),
            href = anchor.attr("href"),
            // get the index of the element
            index = parseInt(href.match(REG_EXP_ELEMENT_INDEX)[1], 10),
            // get id of channel
            channelId = parseInt(href.match(REG_EXP_CHANNEL_ID)[1], 10);
        
        feedHolder.animate({
          left: index * -channelWidth
        }, "fast", function() {
          this.setCurrentChannelId(channelId);
          this.setCurrentChannelLocationHash(anchor.attr("title"));
          
          // trigger global notification
          protonet.globals.notifications.trigger("channel.changed", channelId);
        }.bind(this));
        
        container.find(".active").toggleClass("active");
        anchor.parent("li").toggleClass("active");
        anchor.find(".notification").remove();
        
        event.preventDefault();
      }.bind(this));
      
      protonet.globals.notifications.bind("message.new", function(e, message, channelId) {
        /**
         * Show a little badge on the channel when it's not focused
         */
        if (channelId != this.getCurrentChannelId()) {
          this.notify(channelId);
        }
      }.bind(this));
    },

    _observeInStreamMentions: function() {
      $("span.channel").live("click", function(e){
        var channelName = this.channelsDowncaseMapping[$(e.currentTarget).text().toLowerCase()];
        location.hash = "channel_name=" + encodeURIComponent();
        this._switchToAnchoredChannel();
      }.bind(this));
    },

    _switchToAnchoredChannel: function() {
      var match = location.hash.match(/channel_name=(.+)/);
      if (match) {
        var channelName = decodeURIComponent(match[1]);
        var channelLink = $("#channel a[title='" + protonet.utils.addSlashes(channelName) + "']");
        if(channelLink.length == 1) {
          channelLink.click();
        } else {
          var channelSubscriptionForm = $("<form />", {
            method: "post",
            action: "/listens/?channel_name=" + channelName
          }).hide();
          channelSubscriptionForm.append($('<input type="text" name="authenticity_token" value="' + protonet.config.authenticity_token + '">'));
          channelSubscriptionForm.append($('<input type="submit" name="button" id="button" value="Submit">'));
          $('body').append(channelSubscriptionForm);
          channelSubscriptionForm.submit();
        }
      }
    },

    notify: function(channelId) {
      var anchor = $("#channel-" + channelId).find("a"),
          notificationElement = anchor.find(".notification");
      if (notificationElement.length == 0) {
        notificationElement = $("<span />", { html: 0, className: "notification" }).appendTo(anchor);
      }
      notificationElement.html(parseInt(notificationElement.html(), 10) + 1);
    },
    
    getCurrentChannelId: function() {
      return parseInt(channelInput.val(), 10);
    },
    
    setCurrentChannelId: function(id) {
      channelInput.val(id);
    },
    
    setCurrentChannelLocationHash: function(name) {
      location.hash = "channel_name=" + encodeURIComponent(name);
    }
  };
  
  return ChannelSelector;
})();
