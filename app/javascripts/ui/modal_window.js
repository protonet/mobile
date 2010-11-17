//= require "../utils/get_scrollbar_width.js"

/**
 * Modal Window
 * 
 * @example
 *    protonet.ui.ModalWindow.update({ content: "foobar", headline: "Listen up!" }).show("my-modal-window"); 
 *    // "my-modal-window" is a css class name which should be set on the dialog element
 *    // in order to make it targetable via css selectors
 */
protonet.ui.ModalWindow = (function($) {
  var elements          = {},
      currentClassName  = null,
      originalClassName = null,
      $document         = $(document),
      $window           = $(window),
      $body             = $(document.body);
  
  function _create() {
    $.extend(elements, {
      shadow:     $("<div />", { className: "modal-window-shadow" }),
      dialog:     $("<div />", { className: originalClassName = "modal-window-dialog" }),
      content:    $("<output />", { className: "modal-window-content" }),
      closeLink:  $("<a />", { className: "modal-window-close-link close-link", html: "X" }),
      headline:   $("<h2 />")
    });
    
    elements.shadow.append(elements.dialog).appendTo($body);
    elements.closeLink.add(elements.headline).add(elements.content).appendTo(elements.dialog);
    
    _observe();
  }
  
  function _observe() {
    /**
     * Close when user hits esc key
     */
    $document.bind("keydown.modal_window", function(event) {
       if (event.keyCode == 27) { hide(); }
     });
     
     $window.bind("resize.modal_window", function(event) {
       position();
     });
     
     elements.closeLink.bind("click.modal_window", hide);
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
  
  function show(className) {
    currentClassName = className;
    
    if (!elements.shadow) {
      _create();
    }
    
    if (!elements.shadow.is(":visible")) {
      elements.shadow.fadeIn("fast");
    }
    
    /**
     * Removes scrollbar on body and replaces it width a padding-left to avoid visual weirdness
     * TODO: This doesn't work on the iPad!
     */
    var oldPaddingRight = parseInt($body.css("padding-right"), 10),
        scrollBarWidth  = protonet.utils.getScrollbarWidth();
    $body.add("html")
      .css("overflow", "hidden")
      .css("padding-right", (oldPaddingRight + scrollBarWidth).px())
      .data("old-padding-right", oldPaddingRight);
    
    // Show the actual dialog
    elements.dialog.attr({ "class": originalClassName }).addClass(currentClassName).show();
    position();
    
    protonet.Notifications.trigger("modal_window.shown");
    
    return this;
  }
  
  function hide() {
    currentClassName = null;
    
    $body.css({
      "overflow": "",
      "padding-right": $body.data("old-padding-right")
    });
    
    elements.dialog.attr({ "class": originalClassName }).add(elements.shadow).hide();
    
    protonet.Notifications.trigger("modal_window.hidden");
    
    return this;
  }
  
  function position() {
    var viewport = {
          width:  $window.width(),
          height: $window.height()
        },
        dialog   = {
          width:  elements.dialog.outerWidth(),
          height: elements.dialog.outerHeight()
        },
        scroll   = {
          left:   $window.scrollLeft(),
          top:    $window.scrollTop()
        },
        top      = scroll.top + viewport.height / 2 - dialog.height / 2,
        left     = scroll.left + viewport.width / 2 - dialog.width / 2;
    
    top  = top < 20 ? 20 : top;
    left = left < 0 ? 0 : left;
    
    elements.shadow.css({
      top:    scroll.top.px(),
      left:   scroll.left.px(),
      width:  viewport.width.px(),
      height: viewport.height.px()
    });
    
    elements.dialog.css({
      top:  top.px(),
      left: left.px()
    });
    
    return this;
  }
  
  function get(element) {
    return elements[element];
  }
  
  function getClassName() {
    return currentClassName;
  }
  
  return {
    show:       show,
    update:     update,
    hide:       hide,
    position:   position,
    get:        get
  };
})(jQuery);

