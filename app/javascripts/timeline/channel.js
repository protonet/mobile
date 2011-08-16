//= require "meep.js"
//= require "../utils/browser_title.js"
//= require "../utils/is_window_focused.js"
//= require "../lib/jquery.inview/jquery.inview.js"

/**
 * @example
 *    // Render a new, unselected, channel into "#channel-container"
 *    var channelData = { id: 1, name: "Ali Schmali", meeps: [{ ... }, { ... }, ...] };
 *    new protonet.timeline.Channel(channelData).render("#channel-container");
 *
 *  @events
 *    channel.change        - Call this with the channel id if you want to switch the channel
 *    channel.rendered      - Triggered when channel, including meeps, is completely rendered
 *    channel.rendered_more - Triggered when a bunch of new meeps are rendered into the channel (due to endless scrolling, etc.)
 *
 */
protonet.timeline.Channel = function(data) {
  this.data         = data;
  this.$window      = $(window);
  
  this._getLink();
  this.unreadReplies = localStorage[this.data.id + ":unread_replies"]  || 0;
  this.unreadMeeps   = localStorage[this.data.id + ":unread_meeps"]    || 0;
  
  this._observe();
};

protonet.timeline.Channel.prototype = {
  config: {
    MERGE_MEEPS_TIMEFRAME: 2 * 60 * 1000, // 2 minutes
    FETCH_MEEPS_URL:       "/meeps"
  },
  
  _getLink: function() {
    this.link = $("#channels [data-channel-id='" + this.data.id + "']");
  },
  
  _observe: function() {
    protonet
      /**
       * Render new meep in selected channel
       * when event is triggered
       */
      .bind("meep.send", function(e, dataOrForm, post) {
        if (!this.isSelected) {
          return;
        }
        this._renderMeep(dataOrForm, this.channelList, post);
      }.bind(this))
    
      /**
       * Render meep when received
       */
      .bind("meep.receive", function(e, meepData) {
        if (meepData.channel_id != this.data.id) {
          return;
        }
      
        var instance = this._renderMeep(meepData, this.channelList);
      
        this._notifications();
        this._replyNotifications(meepData, instance);
      }.bind(this))
    
      /**
       * Set fixed scroll position when user scrolled down in timeline
       * (eg. to watch a video) while new meep occurs
       */
      .bind("meep.rendered", function(e, meepElement, meepData, instance) {
        if (meepData.channel_id != this.data.id) {
          return;
        }
      
        var channelPositionTop = this.channelList.offset().top,
            scrollPositionTop  = this.$window.scrollTop(),
            offset             = 40;
      
        if (scrollPositionTop > (channelPositionTop + offset)) {
          var meepHeight = meepElement.outerHeight(true);
          this.$window.scrollTop(scrollPositionTop + meepHeight);
        }
      }.bind(this))
    
      /**
       * Render meep in this channel if it contains a channel reply
       */
      .bind("meep.sent", function(e, meepElement, meepData, instance) {
        if (meepData.channel_id == this.data.id) {
          return;
        }
      
        // Already a reply, avoid non-ending loop
        if (meepData.reply_from) {
          return;
        }
      
        if ($.inArray(this.data.id, instance.channelReplies) == -1) {
          return;
        }
      
        var newMeepData = $.extend({}, meepData, {
          reply_from: meepData.channel_id,
          channel_id: this.data.id
        });
      
        this._renderMeep(newMeepData, this.channelList, true);
      }.bind(this))
    
      /**
       * Make sure that the data object is up to date
       * by tracking incoming and outgoing meeps
       */
      .bind("meep.sent", function(e, meepElement, meepData, instance) {
        if (meepData.channel_id == this.data.id) {
          this.data.meeps.push(meepData);
        }
      }.bind(this))
      
      .bind("meep.receive", function(e, meepData) {
        if (meepData.channel_id == this.data.id) {
          this.data.meeps.push(meepData);
        }
      }.bind(this))
      
      .bind("channel.rendered_more", function(e, channelList, data) {
        Array.prototype.unshift.apply(this.data.meeps, data.meeps || []);
      }.bind(this))
      
      /**
       * Set tab to active and store state
       */
      .bind("channel.change", function(e, channelId) {
        this.isSelected = channelId == this.data.id;
        this.toggle();
      }.bind(this))
      
      .bind("channel.hide", function() {
        this.isSelected = false;
        this.toggle();
      }.bind(this))
      
      /**
       * Init endless scroller and no meeps hint after meeps are rendered
       */
      .bind("channel.rendered channel.rendered_more", function(e, channelList, data, instance) {
        if (instance != this) {
          return;
        }
      
        this._initEndlessScroller();
        this._initNoMeepsHint();
      }.bind(this))
      
      /**
       * Update reference to channel link after reordering
       * since our jquery sortable jquery element destroys the dom strcuture
       */
      .bind("channels.reordered", this._getLink.bind(this));
    
    /**
     * Store number of unread meeps/replies in local storage
     */
    this.$window.bind("beforeunload", function() {
      localStorage[this.data.id + ":unread_meeps"]   = this.unreadMeeps;
      localStorage[this.data.id + ":unread_replies"] = this.unreadReplies;
    }.bind(this));
  },
  
  /**
   * Decides whether or not a small badge
   * should be displayed, based on the number
   * of unread meeps
   */
  _toggleBadge: function(preventEffect) {
    if (!this.badge) {
      this.badge = $("<span>", {
        "class":  "badge",
        text:      0
      }).appendTo(this.link);
    }
    
    if (this.unreadMeeps > 0) {
      this.badge.text(this.unreadMeeps).show();
      if (!this.badge.is(":animated") && !preventEffect) {
        this.badge.effect("bounce", { times: 3, distance: 12 }, 125);
      }
    } else {
      this.badge.hide();
    }
  },
  
  /**
   * Decides whether or not a small badge
   * should be displayed, based on the number
   * of unread replies
   */
  _toggleReplyBadge: function() {
    if (!this.replyBadge) {
      this.replyBadge = $("<span>", {
        "class":  "reply-badge",
        text:      0
      }).appendTo(this.link);
    }
    
    if (this.unreadReplies > 0) {
      this.replyBadge.text(this.unreadReplies).show();
    } else {
      this.replyBadge.hide();
    }
  },
  
  destroy: function() {
    this.link.parent().remove();
    
    this.data = { id: null };
    
    this.channelList && this.channelList.remove();
    this.noMeepsHint && this.noMeepsHint.remove();
    
    localStorage.removeItem(this.data.id + ":unread_replies");
    localStorage.removeItem(this.data.id + ":unread_meeps");
    
    return this;
  },
  
  /**
   * Decide whether the channel should be shown or hidden
   */
  toggle: function() {
    if (this.isSelected) {
      this.unreadReplies = this.unreadMeeps = 0;
      this.channelList.prependTo(this.container);
      this.link.addClass("active");
    } else {
      this.channelList.detach();
      this.link.removeClass("active");
    }
    
    this._toggleReplyBadge();
    this._toggleBadge(true);
    
    return this;
  },
  
  /**
   * Renders the channel list and decides whether the list is visible or not
   */
  render: function(container) {
    this.container = container;
    this.channelList = $("<ul>", {
      "class":            "meeps",
      "data-channel-id":  this.data.id
    }).data({ channel: this.data, instance: this });
    
    this._renderMeeps(this.data.meeps, this.channelList, function() {
      protonet.trigger("channel.rendered", [this.channelList, this.data, this]);
    }.bind(this));
    
    return this;
  },
  
  renderTab: function(tabContainer) {
    var $li = $("<li>");
    
    this.link = $("<a>", {
      href: "/?channel_id=" + this.data.id,
      'data-channel-id': this.data.id,
      text: this.data.display_name || this.data.name
    }).appendTo($li);
    
    $li.appendTo(tabContainer);
    
    return this;
  },
  
  /**
   * Render meeps non-blocking into the given dom element
   */
  _renderMeeps: function(meepsData, channelList, callback) {
    /**
     * Reverse meeps since we have to render them from top to bottom
     * in order to ensure that meep-merging works
     *
     * Chunking needed to avoid ui blocking while rendering
     */
    meepsData.reverse().chunk(function(meepData) {
      this._renderMeep(meepData, channelList);
    }.bind(this), callback);
  },
  
  /**
   * Call this method if you want to
   * render older meeps into the channel list
   */
  _renderMoreMeeps: function(meepsData) {
    var tempContainer = $("<ul>");
    this._renderMeeps(meepsData, tempContainer, function() {
      this.channelList.append(tempContainer.children());
      protonet.trigger("channel.rendered_more", [this.channelList, this.data, this]);
    }.bind(this));
  },
  
  /**
   * Renders a meep into the given channelList
   * If you want the meep to be sent to the server
   * pass post = true
   */
  _renderMeep: function(meepDataOrForm, channelList, post) {
    var meep              = new protonet.timeline.Meep(meepDataOrForm),
        previousMeep      = channelList.find(":first").data("instance");
    
    if (previousMeep && this._shouldBeMerged(previousMeep, meep)) {
      meep.mergeWith(previousMeep.element);
    } else {
      meep.render(channelList);
    }
    
    if (post) {
      meep.post();
    }
    
    return meep;
  },
  
  /**
   * Load meeps for channel
   */
  _loadMeeps: function(parameters, callback) {
    protonet.trigger("timeline.loading_start");
    
    $.extend(parameters, { channel_id: this.data.id });
    $.ajax({
      url:  this.config.FETCH_MEEPS_URL,
      type: "get",
      data: parameters,
      success: function(response) {
        if (!response || !response.length) {
          return;
        }
        
        (callback || $.noop)(response);
      },
      complete: function() {
        protonet.trigger("timeline.loading_end");
      }
    });
  },
  
  /**
   * Provide this method with two meep data objects
   * and it will tell you whether they should be merged
   *
   * Merge previous and new meep when ...
   *  ... new meep came from a different channel as reply
   *  ... the previous meep is not errorneous
   *  ... authors are the same
   *  ... the time difference between both is less than MERGE_MEEPS_TIMEFRAME
   *  ... the new meep hasn't got a text extension attached
   */
  _shouldBeMerged: function(previousMeep, newMeep) {
    var newMeepData       = newMeep.data,
        previousMeepData  = previousMeep.data;
    
    return !newMeepData.reply_from &&
      !previousMeep.error &&
      !newMeepData.text_extension &&
      newMeepData.user_id == previousMeepData.user_id &&
      new Date(newMeepData.created_at) - new Date(previousMeepData.created_at) < this.config.MERGE_MEEPS_TIMEFRAME;
  },
  
  /**
   * Load more meeps when last meep in list is visible
   * in the browser's viewport
   */
  _initEndlessScroller: function() {
    var lastMeepInList = this.channelList.children(":last").addClass("separator");
    
    lastMeepInList.one("inview", function(event, visible) {
      if (!visible) {
        return;
      }
      var lastMeepId = lastMeepInList.find("article:last").data("meep").id;
      this._loadMeeps({ last_id: lastMeepId }, this._renderMoreMeeps.bind(this));
    }.bind(this));
  },
  
  /**
   * Show small text hint when
   * channel has no meeps yet
   * TODO: This isn't working currently
   */
  _initNoMeepsHint: function() {
    if (this.data.meeps.length) {
      return;
    }
    
    this.noMeepsHint = $("<div>", {
      "class": "no-meeps-available"
    }).hide().html(protonet.t("NO_MEEPS_AVAILABLE")).appendTo(this.container);
    
    protonet.bind("channel.change", function(e, id) {
      if (this.data.id == id && !this.data.meeps.length) {
        this.noMeepsHint.show();
      } else {
        this.noMeepsHint.hide();
      }
    }.bind(this));
    
    protonet.bind("meep.rendered", function(e, meepElement, meepData) {
      if (meepData.channel_id != this.data.id) {
        return;
      }
      
      this.noMeepsHint.remove();
    }.bind(this));
  },
  
  /**
   * Do all kind of notifications when a new meep is received
   *    - Animate browser title when page is not focused
   *    - Play sound when page is not focused
   *    - Show badge in channel link when page is not focused
   */
  _notifications: function() {
    var isWindowFocused       = protonet.utils.isWindowFocused(),
        isAllowedToPlaySound  = protonet.user.Config.get("sound");
    
    if (!isWindowFocused && this.isSelected) {
      protonet.utils.BrowserTitle.set("+++ New messages", true, true);
    }
    
    if (!isWindowFocused && this.isSelected && isAllowedToPlaySound) {
      if (protonet.user.Browser.SUPPORTS_HTML5_AUDIO_OGG()) {
        new Audio("/sounds/notification.ogg").play();
      } else if (protonet.user.Browser.SUPPORTS_HTML5_AUDIO_MP3()) {
        new Audio("/sounds/notification.mp3").play();
      } else if (protonet.user.Browser.SUPPORTS_HTML5_AUDIO_WAV()) {
        new Audio("/sounds/notification.wav").play();
      }
    }
    
    if (!this.isSelected) {
      this.unreadMeeps++;
      this._toggleBadge();
    }
  },
  
  /**
   * Handle user replies
   */
  _replyNotifications: function(meepData, instance) {
    var isWindowFocused             = protonet.utils.isWindowFocused(),
        isAllowedToDoNotifications  = protonet.user.Config.get("reply_notification"),
        userId                      = protonet.user.data.id,
        isReplyToViewer             = $.inArray(userId, instance.userReplies) != -1;
    
    if (isReplyToViewer && isAllowedToDoNotifications && !isWindowFocused) {
      new protonet.ui.Notification({
        image:  meepData.avatar,
        title:  protonet.t("REPLY_NOTIFICATION_TITLE"),
        text:   meepData.message.truncate(140)
      });
    }
    
    if (!this.isSelected && isReplyToViewer) {
      this.unreadReplies++;
      this._toggleReplyBadge();
    }
  }
};