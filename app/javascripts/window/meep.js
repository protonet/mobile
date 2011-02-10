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
    
    adjust();
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
  
  function adjust(duration) {
    duration = $.type(duration) == "number" ? duration : 500;
    var meepHeight          = currentMeep.element.outerHeight(),
        newBorderMarginTop  = -(meepHeight + border.outerHeight() - border.height()) / 2,
        prevSiblings        = currentMeep.element.prevAll(),
        newMarginTop        = -meepHeight / 2;
    
    prevSiblings.each(function(i, element) { newMarginTop -= $(element).outerHeight(true); });
    meepList.css("margin-top", newMarginTop.px());
    
    border.animate({
      marginTop: newBorderMarginTop.px(),
      height:    meepHeight.px()
    }, duration, function() {
      loadingEnd();
      currentMeep.element.addClass("selected");
      if (duration > 0) {
        currentMeep.element.hide().fadeIn(duration);
      }
    });
    
    _loadAndRender("before", currentMeep);
    _loadAndRender("after", currentMeep);
    
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
  
  function _getMeepList() {
    return $("<ul>", {
      className: "meeps"
    }).bind("text_extension.show_flash text_extension.hide_flash", function() {
      adjust(0);
    });
  }
  
  protonet.utils.History.observe(/(?:\?|&)meep_id=(\d+)/, show);
  
  return {
    show:       show,
    adjust:     adjust, 
    loading:    loading,
    loadingEnd: loadingEnd
  };
})();