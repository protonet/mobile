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
    meepList  = meepList ? meepList.html("") : $("<ul>", { className: "meeps" });
    
    title.text(protonet.t("MEEP_WINDOW_HEADLINE").replace("{id}", "#" + data.id));
    
    protonet.ui.ModalWindow.update({ content: meepList.add(border).add(next).add(previous) }).show(CLASS_NAME);
    
    data.channel_id = "detail_view";
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
  
  function adjust() {
    var meepHeight          = currentMeep.element.outerHeight(),
        newBorderMarginTop  = -(meepHeight + border.outerHeight() - border.height()) / 2,
        newMarginTop        = -currentMeep.element.outerHeight() / 2;
    
    meepList.css("margin-top", newMarginTop.px());
    
    border.animate({
      marginTop: newBorderMarginTop.px(),
      height:    meepHeight.px()
    }, 500, function() {
      loadingEnd();
      currentMeep.element.css("z-index", 5);
    });
    
    return this;
  }
  
  return {
    show:       show,
    loading:    loading,
    loadingEnd: loadingEnd
  };
})();