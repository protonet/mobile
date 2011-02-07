//= require "../utils/get_scrollbar_width.js"

/**
 * Modal Window
 * 
 * @example
 *    protonet.ui.ModalWindow.update({
 *      content: "foobar",
 *      headline: "Listen up!"
 *    }).show({
 *      // "my-modal-window" is a css class name which should be set on the dialog element
 *      // in order to make it targetable via css selectors
 *      className:    "my-modal-window"
 *    });
 */
protonet.ui.ModalWindow = (function($) {
  var elements          = {},
      scrollbarWidth    = 0,
      offset            = 50,
      currentClassName  = null,
      originalClassName = null,
      $document         = $(document),
      $window           = $(window),
      $body             = $(document.body);
  
  function _create() {
    $.extend(elements, {
      shadow:     $("<div />",    { className: "modal-window-shadow" }),
      dialog:     $("<div />",    { className: originalClassName = "modal-window-dialog" }),
      content:    $("<output />", { className: "modal-window-content" }),
      closeLink:  $("<a />",      { className: "modal-window-close-link close-link", html: "X" }),
      headline:   $("<h2 />")
    });
    
    elements.shadow.append(elements.dialog).appendTo($body);
    elements.closeLink.add(elements.headline).add(elements.content).appendTo(elements.dialog);
    
    elements.dialog.queue();
  }
  
  function _observe() {
    /**
     * Close when user hits esc key
     */
    $document.bind("keydown.modal_window", function(event) {
      if (event.keyCode == 27) { hide(); }
    });
    
    $window
      .bind("mousewheel.modal_window", false)
      .bind("scroll.modal_window", position)
      .bind("resize.modal_window", resize);
    elements.shadow
      .bind("mousedown.modal_window", function(event) { event.preventDefault(); })
      .bind("click.modal_window", function(event) {
        if (event.target == elements.shadow[0]) { hide(); }
      });
    
    elements.closeLink.bind("click.modal_window", hide);
    elements.dialog.bind("mousedown.modal_window mousewheel.modal_window", function(event) { event.stopPropagation(); });
  }
  
  function _unobserve() {
    $window
      .add($document)
      .add(elements.shadow)
      .add(elements.closeLink)
      .add(elements.dialog)
      .unbind(".modal_window");
  }
  
  /**
   * Update components
   */
  function update(components) {
    if (!elements.shadow) {
      _create();
    }
    
    $.each(components, function(key, value) { elements[key].html(value); });
    
    return this;
  }
  
  function show(options) {
    var isAlreadyVisible = elements.shadow.is(":visible");
    currentClassName = options.className;
    
    if (!elements.shadow) {
      _create();
    }
    
    if (!isAlreadyVisible) {
      elements.shadow.fadeIn("fast");
    }
    
    elements.dialog.attr({ "class": originalClassName }).addClass(currentClassName);
    
    _observe();
    position(true);
    resize(true);
    
    var originalPaddingRight = $body.css("padding-right");
    scrollbarWidth = scrollbarWidth || protonet.utils.getScrollbarWidth();
    
    $body
      .css({
        "overflow-y": "hidden",
        "padding-right": (parseInt(originalPaddingRight, 10) + scrollbarWidth).px()
      });
    
    elements.content.css("margin-right", (-scrollbarWidth).px());
    
    protonet.Notifications.trigger("modal_window.shown");
    
    return this;
  }
  
  function hide() {
    currentClassName = null;
    
    elements.shadow.hide();
    
    $body
      .css({
        "overflow-y": "",
        "padding-right": ""
      });
    
    // TODO: This doesn't work for all cases!
    protonet.utils.History.register("/");
    
    _unobserve();
    protonet.Notifications.trigger("modal_window.hidden");
    
    return this;
  }
  
  function position(immediately) {
    var top = ($window.scrollTop() + offset).px();
    if (immediately === true) {
      elements.dialog.css("top", top);
    } else {
      elements.dialog.stop(true).delay(500).animate({ top: top }, 500);
    }
    
    return this;
  }
  
  function resize(immediately) {
    var height = ($window.height() - 2 * offset - elements.headline.outerHeight());
    height = Math.max(175, height).px();
    if (immediately === true) {
      elements.content.css("height", height);
    } else {
      elements.content.stop(true).delay(500).animate({ height: height }, 500, function() {
        elements.content.css({ overflowX: "", overflowY: "" });
      });
    }
    return this;
  }
  
  function get(element) {
    return elements[element];
  }
  
  function getClassName() {
    return currentClassName;
  }
  
  function loading() {
    return update({ content: $("<p>", { html: protonet.t("MODAL_WINDOW_LOADING"), className: "loading-indicator" }) });
  }
  
  function loadingEnd() {
    elements.content.children(".loading-indicator").remove();
    return this;
  }
  
  return {
    show:         show,
    update:       update,
    hide:         hide,
    position:     position,
    get:          get,
    getClassName: getClassName,
    loading:      loading,
    loadingEnd:   loadingEnd
  };
})(jQuery);