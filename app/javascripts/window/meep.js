//= require "../utils/parse_query_string.js"

// TODO: This is certainly not the best piece of code I ever wrote
// but I'm pretty good at drinking beer. (tiff)
protonet.window.Meep = (function() {
  var CLASS_NAME          = "meep-window",
      URL                 = "/tweets/{action}",
      COUNT               = 5,
      $document           = $(document),
      currentChannelName  = "unknown",
      currentMeep,
      border,
      meepList,
      next,
      previous;
  
  function show(dataOrId) {
    border = border || (function() {
      return $("<div>", { className: "border" });
    })();
    next      = next     || $("<a>", { className: "next" });
    previous  = previous || $("<a>", { className: "previous" });
    meepList  = _getMeepList();
    
    border.append(next).append(previous);
    
    var content = meepList.add(border);
    protonet.ui.ModalWindow
      .update({ content: content })
      .show({ className: CLASS_NAME });
    
    loading();
    _observe();
    
    if ($.type(dataOrId) == "object") {
      _show(dataOrId);
    } else {
      _loadMeep(dataOrId, _show);
    }
    
    return this;
  }
  
  function _show(data) {
    currentChannelName = protonet.timeline.Channels.getChannelName(data.channel_id || data.posted_in);
    
    // Make sure that the meep doesn't conflict with channels
    data.channel_id = null;
    select(new protonet.timeline.Meep(data).render(meepList), 500, 0);
  }
  
  function _loadMeep(id, callback) {
    $.ajax({
      url:      URL.replace("{action}", id),
      success:  callback,
      error:    function() {
        protonet.Notifications.trigger("flash_message.error", protonet.t("DETAIL_VIEW_LOADING_ERROR"));
      }
    });
  }
  
  function select(meep, borderAnimationDuration, meepListAnimationDuration) {
    currentMeep = meep;
    
    // Change title text
    var titleText = protonet.t("MEEP_WINDOW_HEADLINE")
      .replace("{avatar}", '<img src="' + meep.data.avatar + '"  alt=\"\">')
      .replace("{id}", "#" + meep.data.id)
      .replace("{channel_name}", currentChannelName);
      
    protonet.ui.ModalWindow.update({ headline: titleText });
    
    // Create history entry
    protonet.utils.History.register("?meep_id=" +  meep.data.id);
    
    adjust(borderAnimationDuration, meepListAnimationDuration);
    
    return this;
  }
  
  function loading() {
    border.addClass("loading");
    return this;
  }
  
  function loadingEnd() {
    border.removeClass("loading");
    return this;
  }
  
  function adjust(borderAnimationDuration, meepListAnimationDuration) {
    meepList.queue(function(next) {
      borderAnimationDuration   = borderAnimationDuration || 0;
      meepListAnimationDuration = meepListAnimationDuration || 0;
      var meepHeight              = currentMeep.element.outerHeight(),
          newBorderMarginTop      = -(meepHeight + border.outerHeight() - border.height()) / 2,
          prevSiblings            = currentMeep.element.prevAll(),
          newMarginTop            = -meepHeight / 2,
          additionalOffset        = $.browser.mozilla ? 0.2 : 0, // Don't ask. Needed for firefox
          nextIfAnimationComplete = function() {
            // :animated is removed after the complete callback is fired
            // therefore the timeout
            setTimeout(function() {
              if (meepList.is(":animated") || border.is(":animated")) {
                return;
              }
              next();
            }, 0);
          };
          
      
      prevSiblings.each(function(i, element) { newMarginTop -= $(element).outerHeight(true) - additionalOffset; });

      meepList.children().removeClass("selected");
      loading();
      
      meepList.stop().animate({
        marginTop: newMarginTop.px(),
      }, {
        queue:    false,
        duration: meepListAnimationDuration,
        complete: nextIfAnimationComplete
      });
      
      border.stop().animate({
        marginTop: newBorderMarginTop.px(),
        height:    meepHeight.px()
      }, {
        queue:    false,
        duration: borderAnimationDuration,
        complete: function() {
          loadingEnd();
          currentMeep.element.addClass("selected");
          nextIfAnimationComplete();
        }
      });
    });
    
    return this;
  }
  
  function _loadAndRender(position, currentMeep) {
    $.ajax({
      data:     { id: currentMeep.data.id, count: COUNT },
      url:      URL.replace("{action}", position),
      success:  function(data) {
        if (!data.length) {
          return;
        }
        
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
      },
      error:    function() {
        protonet.Notifications.trigger("flash_message.error", protonet.t("DETAIL_VIEW_LOADING_ERROR"));
      }
    });
  }
  
  function scrollByOffset(offset) {
    var meepElementToScrollTo;
    if (offset == 0) {
      return this;
    } else if (offset > 0) {
      meepElementToScrollTo = currentMeep.element.prevAll().eq(offset - 1);
    } else if (offset < 0) {
      meepElementToScrollTo = currentMeep.element.nextAll().eq(-offset - 1);
    }
    
    if (meepElementToScrollTo.length) {
      scrollTo(meepElementToScrollTo);
    }
    
    return this;
  }
  
  function scrollTo(meepElement) {
    select(meepElement.data("instance"), 250, 250);
    return this;
  }
  
  function _observe() {
    var dialogElement  = protonet.ui.ModalWindow.get("dialog"),
        timeout         = null,
        spawnScrolling  = function(offset) {
          clearTimeout(timeout);
          timeout = setTimeout(function() {
            scrollByOffset(offset);
          }, 10);
        };
    
    $document.bind("keydown.meep_window", function(event) {
      var keyCode = event.keyCode;
      if (keyCode == 40) { // arrow down
        scrollByOffset(-1);
      } else if (keyCode == 38) { // arrow up
        scrollByOffset(+1);
      }
    });
    
    if (protonet.user.Browser.SUPPORTS_EVENT("DOMMouseScroll")) {
      dialogElement.bind("DOMMouseScroll.meep_window", function(event) {
        event = event.originalEvent;
        if (event.axis == event.VERTICAL_AXIS && event.detail != 0) {
          spawnScrolling(event.detail < 0 ? 1 : -1);
        }
        event.preventDefault();
      });
    } else if (protonet.user.Browser.SUPPORTS_EVENT("mousewheel")) {
      dialogElement.bind("mousewheel.meep_window", function(event) {
        event = event.originalEvent;
        if (event.wheelDeltaY != 0) {
          spawnScrolling(event.wheelDeltaY < 0 ? -1 : 1);
        }
        event.preventDefault();
      });
    }
    
    next.bind("click.meep_window", function() {
      scrollByOffset(+1);
    });
    
    previous.bind("click.meep_window", function() {
      scrollByOffset(-1);
    });
    
    meepList
      .delegate("li:not(.selected)", "click.meep_window", function(event) {
        scrollTo($(this));
        event.preventDefault();
      })
      .delegate("li", "text_extension.show_flash", function() {
        var meepElement = $(this);
        if (meepElement.is(".selected")) {
          adjust();
        } else {
          scrollTo(meepElement);
        }
      })
      .delegate("li", "text_extension.hide_flash", function() {
        adjust();
      })
      .delegate("li:first", "inview.meep_window", function(event, isInView) {
        var $this = $(this);
        if (!$this.data("already_loaded_after") && isInView) {
          _loadAndRender("after", $this.data("instance"));
          $this.data("already_loaded_after", true);
        }
      })
      .delegate("li:last", "inview.meep_window", function(event, isInView) {
        var $this = $(this);
        if (!$this.data("already_loaded_before") && isInView) {
          _loadAndRender("before", $this.data("instance"));
          $this.data("already_loaded_before", true);
        }
      });
    
    protonet.Notifications.one("modal_window.hidden", _unobserve);
  }
  
  function _unobserve() {
    protonet.ui.ModalWindow.get("content")
      .add(next)
      .add(previous)
      .add($document)
      .add(meepList)
      .add(protonet.ui.ModalWindow.get("dialog"))
      .unbind(".meep_window")
      .unbind("text_extension");
  }
  
  function _getMeepList() {
    return $("<ul>", { className: "meeps" });
  }
  
  protonet.utils.History.observe(/(?:\?|&)meep_id=(\d+)/, show);
  
  return {
    show:             show,
    adjust:           adjust,
    scrollTo:         scrollTo,
    scrollByOffset:   scrollByOffset,
    select:           select,
    loading:          loading,
    loadingEnd:       loadingEnd
  };
})();