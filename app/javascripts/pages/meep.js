// TODO: This is certainly not the best piece of code I ever wrote
// but I'm pretty good at drinking beer. (tiff)
protonet.pages.Meep = Class.create(protonet.Page, {
  initialize: function($super) {
    this.currentChannelName = "unknown";
    
    this.border       = $("<div>",  { "class": "border" });
    this.next         = $("<a>",    { "class": "next" });
    this.previous     = $("<a>",    { "class": "previous" });
    this.shareButton  = $("<a>",    { "class": "share", title: "Share!" });
    this.meepList     = $("<ul>",   { "class": "meeps" });
    this.border.append(this.next).append(this.previous).append(this.shareButton);
    
    $super("meep", { meepsPerRequest: 5, request: false });
  },
  
  show: function($super, id) {
    if (!this.visible) {
      $super(id);
      this.content(this.meepList.add(this.border));
    }
    
    this.update(id);
  },
  
  update: function(id) {
    var meepToSelect = this.meepList.children(".meep").filter(function() {
      var data = $(this).data("meep");
      return data && (data.id == id);
    });
    
    if (meepToSelect.length) {
      this.select(meepToSelect, 500, 0);
    } else {
      this.loading();
      this._loadMeep(id, function(data) {
        // Make sure that the meep doesn't conflict with channels
        this.currentChannelName = protonet.timeline.Channels.getChannelName(data.channel_id || data.posted_in);
        data.channel_id = null;
        this.select(new protonet.timeline.Meep(data).render(this.meepList), 500, 0);
      }.bind(this));
    }
  },
  
  hide: function($super) {
    this.meepList.html("");
    $super();
  },
  
  _initDependencies: function($super) {
    $.behaviors("[data-meep-id]:click", function(element, event) {
      var $element  = $(element),
          action    = $element.data("meep-action");
      switch(action) {
        case "share":
          var meep = $element.parents("article").data("instance");
          protonet.trigger("form.fill", meep.getUrl());
          break;
        default:
          var data = $element.parents("article").data("meep");
          this.show($element.data("meep-id"));
      }
      event.preventDefault();
    }.bind(this));
    
    $super();
  },
  
  _observe: function($super) {
    var timeout,
        $document      = $(document),
        dialogElement  = this.elements.dialog,
        spawnScrolling = function(offset) {
          clearTimeout(timeout);
          timeout = setTimeout(function() { this.scrollByOffset(offset); }.bind(this), 10);
        }.bind(this);
    
    $document.bind("keydown.meep_page", function(event) {
      var keyCode = event.keyCode;
      if (keyCode == 40) { // arrow down
        this.scrollByOffset(-1);
      } else if (keyCode == 38) { // arrow up
        this.scrollByOffset(+1);
      }
    }.bind(this));
    
    if (protonet.user.Browser.SUPPORTS_EVENT("DOMMouseScroll")) {
      // Firefox 4 only supports DOMMouseScroll on the $document object
      $document.bind("DOMMouseScroll.meep_page", function(event) {
        event = event.originalEvent;
        if (event.axis == event.VERTICAL_AXIS && event.detail != 0) {
          spawnScrolling(event.detail < 0 ? 1 : -1);
        }
        event.preventDefault();
      });
    } else if (protonet.user.Browser.SUPPORTS_EVENT("mousewheel")) {
      dialogElement.bind("mousewheel.meep_page", function(event) {
        event = event.originalEvent;
        if (event.wheelDeltaY != 0) {
          spawnScrolling(event.wheelDeltaY < 0 ? -1 : 1);
        }
        event.preventDefault();
      });
    }
    
    this.next.bind("click.meep_page", function() {
      this.scrollByOffset(+1);
    }.bind(this));
    
    this.previous.bind("click.meep_page", function() {
      this.scrollByOffset(-1);
    }.bind(this));
    
    this.shareButton.bind("click.meep_page", function() {
      this.hide();
      protonet.trigger("form.fill", this.selectedMeep.getUrl());
    }.bind(this));
    
    this.meepList
      .delegate("li:not(.selected)", "click.meep_page", function(event) {
        this.select($(event.currentTarget));
        event.preventDefault();
        event.stopPropagation();
      }.bind(this))
      
      .delegate("li", "text_extension.show_media", function(event) {
        var $this = $(event.currentTarget);
        if ($this.is(".selected")) {
          this.adjust();
        } else {
          this.select($this, 250, 250);
        }
      }.bind(this))
      
      .delegate("li", "text_extension.hide_media", function() {
        this.adjust();
      }.bind(this))
      
      .delegate("li:first", "inview.meep_page", function(event, isInView) {
        var $this = $(event.currentTarget);
        if (!$this.data("already_loaded_after") && isInView) {
          this._loadAndRender("after", $this.data("instance"));
          $this.data("already_loaded_after", true);
        }
      }.bind(this))
      
      .delegate("li:last", "inview.meep_page", function(event, isInView) {
        var $this = $(event.currentTarget);
        if (!$this.data("already_loaded_before") && isInView) {
          this._loadAndRender("before", $this.data("instance"));
          $this.data("already_loaded_before", true);
        }
      }.bind(this));
    
    $super();
  },
  
  _unobserve: function($super) {
    this.elements.content.add(this.elements.dialog).add(document).unbind(".meep_page");
    $super();
  },
  
  scrollByOffset: function(offset) {
    var meepElementToScrollTo;
    
    if (offset == 0) {
      return;
    } else if (offset > 0) {
      meepElementToScrollTo = this.selectedMeep.element.prevAll().eq(offset - 1);
    } else if (offset < 0) {
      meepElementToScrollTo = this.selectedMeep.element.nextAll().eq(-offset - 1);
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
    
    this.selectedMeep = meep;
    
    // Change title text
    var titleText = protonet.t("MEEP_WINDOW_HEADLINE")
      .replace("{avatar}", '<img src="' + meep.data.avatar + '"  alt=\"\">')
      .replace("{id}", "#" + meep.data.id)
      .replace("{channel_name}", this.currentChannelName);
      
    this.headline(titleText);
    this.adjust(borderAnimationDuration, meepListAnimationDuration);
    this.setState(meep.data.id);
  },
  
  loading: function() {
    this.border.addClass("loading");
  },
  
  loadingEnd: function() {
    this.border.removeClass("loading");
  },
  
  _loadMeep: function(id, callback) {
    this.ajaxRequest = $.ajax({
      url:      "/tweets/" + id,
      success:  callback,
      error:    function() {
        protonet.trigger("flash_message.error", protonet.t("DETAIL_VIEW_LOADING_ERROR"));
      }
    });
  },
  
  _loadAndRender: function(position, selectedMeep) {
    if (!selectedMeep) {
      return;
    }
    
    $.ajax({
      data:     { id: selectedMeep.data.id, count: this.config.meepsPerRequest },
      url:      "/tweets/" + position,
      success:  function(data) {
        if (!data.length) {
          return;
        }
        
        var meepList = this.meepList;
        
        meepList.queue(function(next) {
          var tempContainer = $("<ul>");
          data.chunk(function(meepData) {
            meepData.channel_id = null;
            return new protonet.timeline.Meep(meepData).render(tempContainer);
          }, function() {
            if (position == "after") {
              var oldMeepListHeight     = meepList.outerHeight(),
                  oldMeepListMarginTop  = parseInt(meepList.css("margin-top"), 10),
                  newMeepListHeight,
                  diffMeepListHeight;
              meepList.prepend(tempContainer.children());
              newMeepListHeight = meepList.outerHeight();
              diffMeepListHeight = newMeepListHeight - oldMeepListHeight;
              meepList.css("margin-top", (oldMeepListMarginTop - diffMeepListHeight).px());
            } else {
              meepList.append(tempContainer.children());
            }
            next();
          });
        });
      }.bind(this),
      error: function() {
        protonet.trigger("flash_message.error", protonet.t("DETAIL_VIEW_LOADING_ERROR"));
      }
    });
  },
  
  adjust: function(borderAnimationDuration, meepListAnimationDuration) {
    borderAnimationDuration   = borderAnimationDuration || 0;
    meepListAnimationDuration = meepListAnimationDuration || 0;
    if (protonet.user.Browser.IS_TOUCH_DEVICE()) {
      // iPad is unbelievable slow that's why we force it to immediately adjust
      borderAnimationDuration = meepListAnimationDuration = 0;
    }
    
    this.meepList.queue(function(next) {
      var meepHeight              = this.selectedMeep.element.outerHeight(),
          newBorderMarginTop      = -(meepHeight + this.border.outerHeight() - this.border.height()) / 2,
          prevSiblings            = this.selectedMeep.element.prevAll(),
          newMarginTop            = -meepHeight / 2,
          additionalOffset        = $.browser.mozilla ? 0.2 : 0, // Don't ask. Needed for firefox
          nextIfAnimationComplete = function() {
            // :animated is removed after the complete callback is fired
            // therefore the timeout
            setTimeout(function() {
              if (this.meepList.is(":animated") || this.border.is(":animated")) {
                return;
              }
              next();
            }.bind(this), 0);
          }.bind(this);
      
      prevSiblings.each(function(i, element) { newMarginTop -= $(element).outerHeight(true) - additionalOffset; });
      
      this.meepList.children().removeClass("selected");
      this.loading();
      
      this.meepList.stop().animate({
        marginTop: newMarginTop.px(),
      }, {
        queue:    false,
        duration: meepListAnimationDuration,
        complete: nextIfAnimationComplete
      });
      
      this.border.stop().animate({
        marginTop: newBorderMarginTop.px(),
        height:    meepHeight.px()
      }, {
        queue:    false,
        duration: borderAnimationDuration,
        complete: function() {
          this.loadingEnd();
          this.selectedMeep.element.addClass("selected");
          nextIfAnimationComplete();
        }.bind(this)
      });
    }.bind(this));
  }
});