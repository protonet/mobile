//= require "meep.js"
//= require "../utils/browser_title.js"
//= require "../utils/is_window_focused.js"
//= require "../media/play_sound.js"
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
(function(protonet) {
  var MERGE_MEEPS_TIMEFRAME = 2 * 60 * 1000,  // 2 minutes
      FETCH_MEEPS_URL       = "/meeps",
      MAX_AMOUNT_MEEPS      = 500,            // Max amount of meeps to render per channel until the garbage collector takes action
      $window               = $(window);
  
  protonet.timeline.Channel = Class.create({
    initialize: function(data) {
      this.data = data;
      this.unreadMeeps = this.unreadReplies = 0;
      this._getTab();
      this._observe();
    },
    
    _getTab: function() {
      this.link = $("#channels [data-channel-id='" + this.data.id + "']");
      this.tab  = this.link.parent();
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
              scrollPositionTop  = $window.scrollTop(),
              offset             = 40;

          if (scrollPositionTop > (channelPositionTop + offset)) {
            var meepHeight = meepElement.outerHeight(true);
            $window.scrollTop(scrollPositionTop + meepHeight);
          }
        }.bind(this))

        /**
         * Render meep in this channel if it contains a channel reply
         */
        .bind("meep.sent", function(e, meepData, meepElement, instance) {
          if (meepData.channel_id == this.data.id) {
            return;
          }

          // Already a reply, avoid non-ending loop
          if (meepData.reply_from) {
            return;
          }
          
          // Prevent creating a channel reply when the channel is not a "real" channel
          if (!protonet.timeline.Channels.getChannelName(+meepData.channel_id)) {
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

        .bind("meep.receive meep.sent", function(e, meepData) {
          if (meepData.channel_id == this.data.id) {
            this.data.meeps.push(meepData);
            if (this.isSelected) {
              this.data.last_read_meep = meepData.id;
            }
          }
        }.bind(this))
        
        .bind("meep.rendered", function(e, meepElement, meepData, instance) {
          if (meepData.channel_id != this.data.id) {
            return;
          }
          
          if (this.data.last_read_meep < meepData.id && !this.isSelected) {
            this.unreadMeeps++;
            var isReplyToViewer = instance.userReplies.indexOf(protonet.user.data.id) !== -1;
            if (isReplyToViewer) {
              this.unreadReplies++;
            }
          }
        }.bind(this))
        
        .bind("channel.rendered_more", function(e, channelList, meepsData, instance) {
          if (instance == this) {
            Array.prototype.unshift.apply(this.data.meeps, meepsData);
          }
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
        }.bind(this));
    },

    _initGarbageCollector: function() {
      var MEEP_ELEMENTS = this.channelList[0].getElementsByTagName("article"); // Use a Live NodeList here
      setInterval(function() {
        if (this.data.meeps.length > MAX_AMOUNT_MEEPS) {
          this.data.meeps.splice(MAX_AMOUNT_MEEPS);
          while (MEEP_ELEMENTS.length > MAX_AMOUNT_MEEPS) {
            $(MEEP_ELEMENTS[MEEP_ELEMENTS.length - 1]).data("instance").destroy();
          }
        }
      }.bind(this), 60000);
    },

    /**
     * Decides whether or not a small badge
     * should be displayed, based on the number
     * of unread meeps
     */
    _toggleBadge: function(preventEffect) {
      if (this.unreadMeeps <= 0 && !this.badgeContainer) {
        return;
      }
      
      this.badgeContainer = this.badgeContainer || $("<div>", {
        "class":  "badge-container"
      }).appendTo(this.link);
      
      if (this.unreadReplies > 0) {
        this.replyBadge = this.replyBadge || $("<span>", {
          "class": "reply-badge"
        }).prependTo(this.badgeContainer);
        this.replyBadge.text(this.unreadReplies > 20 ? "20+" : this.unreadReplies).show();
      } else {
        this.replyBadge && this.replyBadge.hide();
      }
      
      if (this.unreadMeeps > 0) {
        this.meepBadge = this.meepBadge || $("<span>", {
          "class": "meep-badge"
        }).appendTo(this.badgeContainer);
        
        this.badgeContainer.show();
        this.meepBadge.text(this.unreadMeeps > 20 ? "20+" : this.unreadMeeps).show();
        if (!this.meepBadge.is(":animated") && !preventEffect) {
          this.meepBadge.effect("bounce", { times: 3, distance: 12 }, 125);
        }
      } else {
        this.meepBadge && this.meepBadge.hide();
        this.badgeContainer.hide();
      }
    },

    destroy: function() {
      this.link.parent().remove();

      this.data = { id: null, meeps: [] };

      this.channelList && this.channelList.remove();
      this.noMeepsHint && this.noMeepsHint.remove();

      return this;
    },

    /**
     * Decide whether the channel should be shown or hidden
     */
    toggle: function() {
      if (this.isSelected) {
        this.unreadReplies = this.unreadMeeps = 0;
        var lastMeep = this.data.meeps[this.data.meeps.length - 1];
        this.data.last_read_meep = lastMeep && lastMeep.id;
        this.channelList.prependTo(this.container);
        this.link.addClass("active");
      } else {
        this.channelList.detach();
        this.link.removeClass("active");
      }

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
        this._initGarbageCollector();
        this._toggleBadge(true);
      }.bind(this));
      
      this._initNoMeepsHint();
      
      return this;
    },

    renderTab: function(tabContainer) {
      this.tab = $("<li>");
      
      this.link = $("<a>", {
        href:               "/?channel_id=" + this.data.id,
        'data-channel-id':  this.data.id,
        text:               this.data.display_name
      });
      
      this.link .appendTo(this.tab);
      this.tab  .appendTo(tabContainer);
      
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
        protonet.trigger("channel.rendered_more", [this.channelList, meepsData, this]);
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
        url:  FETCH_MEEPS_URL,
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
        newMeepData.author == previousMeepData.author &&
        new Date(newMeepData.created_at) - new Date(previousMeepData.created_at) < MERGE_MEEPS_TIMEFRAME;
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
        protonet.media.playSound("/sounds/notification.ogg", "/sounds/notification.mp3", "/sounds/notification.wav");
      }

      if (!this.isSelected) {
        this._toggleBadge();
      }
    },

    /**
     * Handle user replies
     */
    _replyNotifications: function(meepData, instance) {
      var isWindowFocused             = protonet.utils.isWindowFocused(),
          isAllowedToDoNotifications  = protonet.user.Config.get("reply_notification"),
          isReplyToViewer             = instance.userReplies.indexOf(protonet.user.data.id) !== -1;

      if (isReplyToViewer && isAllowedToDoNotifications && !isWindowFocused) {
        new protonet.ui.Notification({
          image:  meepData.avatar,
          title:  protonet.t("REPLY_NOTIFICATION_TITLE", { author: meepData.author }),
          text:   meepData.message.truncate(140)
        });
      }
    }
  });
})(protonet);