protonet.window.Meep = (function() {
  var CLASS_NAME = "meep-window",
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
    meepList  = meepList ? meepList.html("") : _getMeepList();
    
    title.text(protonet.t("MEEP_WINDOW_HEADLINE").replace("{id}", "#" + data.id));
    
    protonet.ui.ModalWindow.update({ content: meepList.add(border).add(next).add(previous) }).show(CLASS_NAME);
    
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
        newMarginTop        = -currentMeep.element.outerHeight() / 2;
    
    meepList.css("margin-top", newMarginTop.px());
    
    border.animate({
      marginTop: newBorderMarginTop.px(),
      height:    meepHeight.px()
    }, duration, function() {
      loadingEnd();
      currentMeep.element.css("z-index", 5);
    });
    
    return this;
  }
  
  function _getMeepList() {
    return $("<ul>", { className: "meeps" }).bind("text_extension.show_flash text_extension.hide_flash", function() { adjust(0); });
  }
  
  return {
    show:       show,
    adjust:     adjust, 
    loading:    loading,
    loadingEnd: loadingEnd
  };
})();