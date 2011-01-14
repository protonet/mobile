protonet.window.Meep = (function() {
  var CLASS_NAME = "meep-window",
      border,
      title,
      url,
      next,
      previous;
  
  function show(meepId, data) {
    border = border || (function() {
      return $("<div>", { className: "border" })
        .append(url   = $("<input>", { readonly: "readonly" }).focus(function() { setTimeout(function() { url[0].select(); }, 200); }))
        .append(title = $("<h5>"));
    })();
    
    next = next || $("<a>", { className: "next" });
    previous = previous || $("<a>", { className: "previous" });
    
    title.text(protonet.t("MEEP_WINDOW_HEADLINE").replace("{id}", "#" + meepId));
    url.val(location.protocol + "//" + location.host + "?meep_id=" + meepId);
    
    protonet.ui.ModalWindow.update({ content: border.add(next).add(previous) }).show(CLASS_NAME);
    loading();
    
    
    
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
  
  return { show: show };
})();