protonet.window.Meep = (function() {
  var CLASS_NAME = "meep-window",
      border,
      title,
      url;
  
  function show(meepId, data) {
    border = border || (function() {
      return $("<div>", { className: "border" })
        .append(url   = $("<input>", { readonly: "readonly" }).focus(function() { setTimeout(function() { url[0].select(); }, 10); }))
        .append(title = $("<h5>"));
    })();
    
    title.text(protonet.t("MEEP_WINDOW_HEADLINE").replace("{id}", "#" + meepId));
    url.val(location.protocol + "//" + location.host + "?meep_id=" + meepId);
    
    protonet.ui.ModalWindow.update({ content: border }).show(CLASS_NAME);
    
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