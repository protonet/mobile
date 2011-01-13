protonet.window.Meep = (function() {
  var CLASS_NAME = "meep-window";
  
  function show(meepId, data) {
    protonet.ui.ModalWindow.update({
      headline: protonet.t("MEEP_WINDOW_HEADLINE").replace("{id}", "#" + meepId),
      content:  protonet.t("MEEP_WINDOW_LOADING")
    }).show(CLASS_NAME).loading();
  }
  
  return {
    show: show
  };
})();