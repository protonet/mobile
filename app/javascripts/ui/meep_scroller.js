//= require "../events/on_element_removed.js"
//= require "../utils/get_channel_name.js"

protonet.ui.MeepScroller = (function() {
  var $document = $(document);
  
  return Class.create({
    initialize: function($container, $headline) {
      this.$container    = $container;
      this.$headline     = $headline;
      
      this.$meepList     = $("<ul>",   { "class": "meeps" })                                              .appendTo(this.$container);
      this.$border       = $("<div>",  { "class": "border" })                                             .appendTo(this.$container);
      this.$next         = $("<a>",    { "class": "next" })                                               .appendTo(this.$border);
      this.$previous     = $("<a>",    { "class": "previous" })                                           .appendTo(this.$border);
      this.$shareButton  = $("<a>",    { "class": "share", title: "Share/Reply", "data-meep-share": "0" }).appendTo(this.$border);

      this._observe();
    },

    show: function(id) {
      var meepToSelect = this.$meepList.children().filter(function() {
        var data = $(this).data("meep");
        return data.id === id;
      });

      if (meepToSelect.length) {
        this.select(meepToSelect, 500, 0);
      } else {
        this.loading();
        protonet.timeline.Meep.get(id, function(data) {
          // Make sure that the meep doesn't conflict with channels
          this.channelName = protonet.utils.getChannelName(data.channel_id || data.posted_in) || protonet.t("UNKNOWN_CHANNEL");
          delete data.channel_id;
          delete data.posted_in;
          
          this.select(
            new protonet.timeline.Meep(data).render(this.$meepList), 500, 0
          );
        }.bind(this));
      }
    },

    _observe: function() {
      var timeout,
          spawnScrolling = function(offset) {
            clearTimeout(timeout);
            timeout = setTimeout(this.scrollByOffset.bind(this, offset), 10);
          }.bind(this);

      $document.bind("keydown.meep_scroller", function(event) {
        var keyCode = event.keyCode;
        if (keyCode === 40) { // arrow down
          this.scrollByOffset(-1);
        } else if (keyCode === 38) { // arrow up
          this.scrollByOffset(+1);
        }
      }.bind(this));

      $document.delegate("pre", "mousewheel.meep_scroller DOMMouseScroll.meep_scroller", function(event) {
        event.stopImmediatePropagation();
      });

      if (protonet.user.Browser.SUPPORTS_EVENT("DOMMouseScroll")) {
        // Firefox 4 only supports DOMMouseScroll on the $document object
        $document.bind("DOMMouseScroll.meep_scroller", function(event) {
          event = event.originalEvent;
          if (event.axis == event.VERTICAL_AXIS && event.detail != 0) {
            spawnScrolling(event.detail < 0 ? 1 : -1);
          }
          event.preventDefault();
        });
      } else if (protonet.user.Browser.SUPPORTS_EVENT("mousewheel")) {
        $document.bind("mousewheel.meep_scroller", function(event) {
          event = event.originalEvent;
          if (event.wheelDeltaY != 0) {
            spawnScrolling(event.wheelDeltaY < 0 ? -1 : 1);
          }
          event.preventDefault();
        });
      }

      this.$next     .bind("click.meep_scroller", this.scrollByOffset.bind(this, +1));
      this.$previous .bind("click.meep_scroller", this.scrollByOffset.bind(this, -1));

      this.$meepList
        .delegate("li:not(.selected)", "click.meep_scroller", function(event) {
          this.select($(event.currentTarget), 250, 250);
          event.preventDefault();
          event.stopPropagation();
        }.bind(this))

        .delegate("li", "text_extension.show_media", function(event) {
          var $this = $(event.currentTarget);
          if ($this.is(".selected")) {
            this.adjust($this.data("instance"));
          } else {
            this.select($this, 250, 250);
          }
        }.bind(this))

        .delegate("li", "text_extension.hide_media", function(event) {
          var $this = $(event.currentTarget);
          if ($this.is(".selected")) {
            this.adjust($this.data("instance"));
          }
        }.bind(this))

        .delegate("li:first", "inview.meep_scroller", function(event, isInView) {
          var $this = $(event.currentTarget);
          if (!$this.data("already_loaded_after") && isInView) {
            this._loadAndRender("after", $this.data("instance"));
            $this.data("already_loaded_after", true);
          }
        }.bind(this))

        .delegate("li:last", "inview.meep_scroller", function(event, isInView) {
          var $this = $(event.currentTarget);
          if (!$this.data("already_loaded_before") && isInView) {
            this._loadAndRender("before", $this.data("instance"));
            $this.data("already_loaded_before", true);
          }
        }.bind(this));

      // Cleanup events when element gets removed from the dom tree
      protonet.events.onElementRemoved(this.$meepList, this._unobserve.bind(this));
    },

    _unobserve: function() {
      $document.unbind(".meep_scroller");
    },

    scrollByOffset: function(offset) {
      var meepElementToScrollTo;

      if (offset == 0) {
        return;
      } else if (offset > 0) {
        meepElementToScrollTo = this.currentMeep.element.prevAll().eq(offset - 1);
      } else if (offset < 0) {
        meepElementToScrollTo = this.currentMeep.element.nextAll().eq(-offset - 1);
      }

      if (meepElementToScrollTo.length) {
        this.select(meepElementToScrollTo, 250, 250);
      }
    },

    select: function(meep, borderAnimationDuration, meepListAnimationDuration) {
      // Takes a jquery meep object or the class meep instance as 'meep' param
      if (meep instanceof jQuery) {
        meep = meep.data("instance");
      }
      
      // Change title text
      var titleText = protonet.t("MEEP_HEADLINE", {
        avatar:       '<img src="' + meep.getAvatar({ width: 20, height: 20 }) + '"  alt=\"\">',
        id:           meep.data.id,
        channel_name: this.channelName
      });
      
      this.$headline.html(titleText);
      
      this.$shareButton
        .attr("href", "/?share=" + meep.data.id)
        .data("meep-share", meep.data.id);
      
      this.currentMeep = meep;
      this.adjust(meep, borderAnimationDuration, meepListAnimationDuration);
    },

    loading: function() {
      this.$border.addClass("loading");
    },

    loadingEnd: function() {
      this.$border.removeClass("loading");
    },

    _loadAndRender: function(position, meep) {
      $.ajax({
        data:     { id: meep.data.id, count: 8 },
        url:      "/meeps/" + position,
        success:  function(data) {
          if (!data.length) {
            return;
          }
          
          this.$meepList.queue(function(next) {
            var $tempContainer = $("<ul>");
            $.each(data, function(i, meepData) {
              delete meepData.channel_id;
              new protonet.timeline.Meep(meepData).render($tempContainer);
            });
            if (position == "after") {
              var oldMeepListHeight     = this.$meepList.outerHeight(),
                  oldMeepListMarginTop  = this.$meepList.cssUnit("margin-top")[0],
                  newMeepListHeight,
                  diffMeepListHeight;
              meep.element.before($tempContainer.children());
              newMeepListHeight = this.$meepList.outerHeight();
              diffMeepListHeight = newMeepListHeight - oldMeepListHeight;
              this.$meepList.css("margin-top", (oldMeepListMarginTop - diffMeepListHeight).px());
            } else {
              meep.element.after($tempContainer.children());
            }
            next();
          }.bind(this));
        }.bind(this),
        error: function() {
          protonet.trigger("flash_message.error", protonet.t("DETAIL_VIEW_LOADING_ERROR"));
        }
      });
    },

    adjust: function(meep, borderAnimationDuration, meepListAnimationDuration) {
      borderAnimationDuration   = borderAnimationDuration   || 0;
      meepListAnimationDuration = meepListAnimationDuration || 0;
      if (protonet.user.Browser.IS_TOUCH_DEVICE()) {
        // iPad is unbelievable slow that's why we force it to immediately adjust
        borderAnimationDuration = meepListAnimationDuration = 0;
      }
      
      this.$meepList.queue(function(next) {
        var meepHeight              = meep.element.outerHeight(),
            newBorderMarginTop      = -(meepHeight + this.$border.outerHeight() - this.$border.height()) / 2,
            prevSiblings            = meep.element.prevAll(),
            newMarginTop            = -meepHeight / 2,
            additionalOffset        = $.browser.mozilla ? 0.2 : 0, // Don't ask. Needed to satisfy firefox
            nextCalled              = 0,
            nextIfAnimationComplete = function() {
              if (++nextCalled >= 2) {
                this.loadingEnd();
                meep.element.addClass("selected");
                next();
              }
            }.bind(this);

        prevSiblings.each(function(i, element) { newMarginTop -= $(element).outerHeight(true) - additionalOffset; });

        this.$meepList.children().removeClass("selected");
        this.loading();
        
        this.$meepList.stop().animate({
          marginTop:  newMarginTop.px()
        }, {
          queue:      false,
          duration:   meepListAnimationDuration,
          complete:   nextIfAnimationComplete
        });
        this.$border.stop().animate({
          marginTop:  newBorderMarginTop.px(),
          height:     meepHeight.px()
        }, {
          queue:      false,
          duration:   borderAnimationDuration,
          complete:   nextIfAnimationComplete
        });
      }.bind(this));
    }
  });
})();