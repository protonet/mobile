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
     
     $window.bind("resize.modal_window scroll.modal_window", position);
     
     elements.closeLink.add(elements.shadow).bind("click.modal_window", hide);
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
    
    elements.dialog.attr({ "class": originalClassName }).addClass(currentClassName);
    position();
    
    protonet.Notifications.trigger("modal_window.shown");
    
    return this;
  }
  
  function hide() {
    currentClassName = null;
    
    elements.shadow.hide();
    
    protonet.Notifications.trigger("modal_window.hidden");
    
    return this;
  }
  
  function position() {
    elements.dialog.stop().animate({ top: $window.scrollTop().px() }, 1000);
    
    return this;
  }
  
  function get(element) {
    return elements[element];
  }
  
  function getClassName() {
    return currentClassName;
  }
  
  return {
    show:         show,
    update:       update,
    hide:         hide,
    position:     position,
    get:          get,
    getClassName: getClassName
  };
})(jQuery);

