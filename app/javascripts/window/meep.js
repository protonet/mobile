//= require "../utils/parse_query_string.js"

protonet.window.Meep = (function() {
  var CLASS_NAME = "meep-window",
      URL        = "/tweets/{action}",
      COUNT      = 5,
      currentMeep,
      border,
      title,
      meepList,
      next,
      previous;
  
  protonet.Notifications.bind("modal_window.shown", function() {
    _observe();
  });
  
  protonet.Notifications.unbind("modal_window.hidden", function() {
    _unobserve();
  });
  
  function show(dataOrId) {
    border = border || (function() {
      return $("<div>", { className: "border" }).append(title = $("<h5>"));
    })();
    next      = next     || $("<a>", { className: "next" });
    previous  = previous || $("<a>", { className: "previous" });
    meepList  = _getMeepList();
    
    var content = meepList.add(border).add(next).add(previous);
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
    var titleText = protonet.t("MEEP_WINDOW_HEADLINE")
      .replace("{id}", "#" + data.id)
      .replace("{channel_name}", protonet.timeline.Channels.getChannelName(data.channel_id));
    title.text(titleText);
    
    // Make sure that the meep doesn't conflict with channels
    data.channel_id = null;
    currentMeep = new protonet.timeline.Meep(data).render(meepList);
    
    // Create history entry
    protonet.utils.History.register("?meep_id=" +  data.id);
    
    adjust(500, 0);
    
    _loadAndRender("before", currentMeep);
    _loadAndRender("after", currentMeep);
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
  
  function loading() {
    border.addClass("loading");
    return this;
  }
  
  function loadingEnd() {
    border.removeClass("loading");
    return this;
  }
  
  function adjust(borderAnimationDuration, meepListAnimationDuration) {
    borderAnimationDuration   = borderAnimationDuration || 0;
    meepListAnimationDuration = meepListAnimationDuration || 0;
    var meepHeight          = currentMeep.element.outerHeight(),
        newBorderMarginTop  = -(meepHeight + border.outerHeight() - border.height()) / 2,
        prevSiblings        = currentMeep.element.prevAll(),
        newMarginTop        = -meepHeight / 2;
    prevSiblings.each(function(i, element) { newMarginTop -= $(element).outerHeight(true); });
    
    meepList.children().removeClass("selected");
    loading();
    
    meepList.stop(false, false).animate({
      marginTop: newMarginTop.px()
    }, meepListAnimationDuration);
    
    border.stop(false, false).animate({
      marginTop: newBorderMarginTop.px(),
      height:    meepHeight.px()
    }, borderAnimationDuration, function() {
      loadingEnd();
      currentMeep.element.addClass("selected");
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
    currentMeep = meepElement.data("instance");
    adjust(500, 500);
    return this;
  }
  
  function _observe() {
    var contentElement = protonet.ui.ModalWindow.get("content");
    if (protonet.user.Browser.SUPPORTS_EVENT("DOMMouseScroll")) {
      contentElement.bind("DOMMouseScroll.meep_window", function(event) {
        event = event.originalEvent;
        if (event.axis == event.VERTICAL_AXIS && event.detail != 0) {
          scrollByOffset(event.detail < 0 ? 1 : -1);
        }
        event.preventDefault();
      });
    } else if (protonet.user.Browser.SUPPORTS_EVENT("mousewheel")) {
      contentElement.bind("mousewheel.meep_window", function(event) {
        event = event.originalEvent;
        if (event.wheelDeltaY != 0) {
          scrollByOffset(event.wheelDeltaY < 0 ? -1 : 1);
        }
        event.preventDefault();
      });
    }
  }
  
  function _unobserve() {
    protonet.ui.ModalWindow.get("content").unbind(".meep_window");
  }
  
  function _getMeepList() {
    return $("<ul>", {
      className: "meeps"
    }).bind("text_extension.show_flash text_extension.hide_flash", function() {
      adjust(0);
    });
  }
  
  protonet.utils.History.observe(/(?:\?|&)meep_id=(\d+)/, show);
  
  return {
    show:             show,
    adjust:           adjust,
    scrollTo:         scrollTo,
    scrollByOffset:   scrollByOffset,
    loading:          loading,
    loadingEnd:       loadingEnd
  };
})();