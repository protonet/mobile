protonet.ui.ModalWindow = (function($) {
  var elements  = {},
      $document = $(document),
      $window   = $(window),
      $body     = $(document.body);
  
  function _create() {
    $.extend(elements, {
      shadow:     $("<div />", { className: "modal-window-shadow" }),
      dialog:     $("<div />", { className: this.originalClassName = "modal-window-dialog" }),
      content:    $("<output />", { className: "modal-window-content" }),
      closeLink:  $("<a />", { className: "modal-window-close-link", html: "X" }),
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
  
  function show(cssClass) {
    if (!elements.shadow) {
      _create();
    }
    
    if (!elements.shadow.is(":visible")) {
      elements.shadow.fadeIn("fast");
    }
    
    // Remove scrollbar on body
    // TODO: This doesn't work on the iPad!
    $body.add("html").css("overflow", "hidden");
    
    // Show the actual dialog
    elements.dialog.attr({ className: this.originalClassName }).addClass(cssClass).show();
    position();
    
    return this;
  }
  
  function hide() {
    $body.css("overflow", "");
    elements.dialog.attr({ className: this.originalClassName }).add(elements.shadow).hide();
    
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
  
  return {
    show:       show,
    update:     update,
    hide:       hide,
    position:   position,
    get:        get
  };
})(jQuery);

