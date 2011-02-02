protonet.window.Meep = (function() {
  var CLASS_NAME = "meep-window",
      URL        = "/tweets/{position}",
      COUNT      = 4,
      data       = {},
      currentMeep,
      border,
      title,
      meepList,
      next,
      previous;
  
  function show(data) {
    border = border || (function() {
      return $("<div>", { className: "border" }).append(title = $("<h5>"));
    })();
    
    next      = next     || $("<a>", { className: "next" });
    previous  = previous || $("<a>", { className: "previous" });
    meepList  = _getMeepList();
    
    var titleText = protonet.t("MEEP_WINDOW_HEADLINE")
      .replace("{id}", "#" + data.id)
      .replace("{channel_name}", protonet.timeline.Channels.getChannelName(data.channel_id));
    title.text(titleText);
    
    protonet.ui.ModalWindow.update({ content: meepList.add(border).add(next).add(previous) }).show(CLASS_NAME);
    
    // Make sure that it doesn't conflict with channels
    data.channel_id = null;
    currentMeep = new protonet.timeline.Meep(data).render(meepList);
    
    loading();
    adjust();
    
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
      url:      URL.replace("{position}", position),
      success:  function(data) {
        if (!data.length) {
          return;
        }
        var tempContainer = $("<ul>");
        data.reverse().chunk(function(meepData) {
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
  
  return {
    show:       show,
    adjust:     adjust, 
    loading:    loading,
    loadingEnd: loadingEnd
  };
})();