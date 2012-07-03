//= require "../utils/get_scrollbar_width.js"
//= require "../utils/guess_file_type.js"
//= require "../effects/blink.js"

/**
 * Modal Window
 * 
 * @example
 *    protonet.ui.ModalWindow.show().content("Lorem ipsum ...");
 */

protonet.ui.ModalWindow = (function() {
  var undef,
      elements,
      scrollbarWidth,
      currentRequest,
      droppable,
      urlBeforeOpened               = location.href,
      // Margin top and bottom (TODO: extract this logic to a css file)
      offsetTop                     = 65,
      offsetBottom                  = 20,
      visible                       = false,
      // Needed to preload stylesheets before rendering the corresponding HTML
      regExpStylesheets             = /<link.*\shref=(?:\"|')([^>"]+?\.css(?:\?.+?)?)(?:\"|')[^>]+>/gi,
      // Cached references
      $body                         = $(document.body);
  
  // Needed to restore the history when modal window closes
  protonet.on("history.change", function() {
    if (!visible) {
      setTimeout(function() { urlBeforeOpened = location.href; }, 0);
    }
  });
  
  protonet.utils.History.addHook(function(url) {
    if (url === urlBeforeOpened && visible) {
      hide();
      return true;
    }
  });
  
  function _fireUnload() {
    protonet.trigger("modal_window.unload");
  }
  
  function _abortCurrentRequest() {
    try { currentRequest.abort(); } catch(e) {}
  }
  
  function _create() {
    /**
     * Creates the following HTML structure:
     *
     *    <div class="modal-window-shadow">
     *      <section class="modal-window">
     *        <a class="close-link">X</a>
     *        <output><!-- HERE GOES THE CONTENT --></output>
     *      </section>
     *    </div>
     */
    elements            = {};
    elements.container  = $("<div>",      { "class": "modal-window-shadow" });
    elements.dialog     = $("<section>",  { "class": "modal-window" }).appendTo(elements.container);
    elements.content    = $("<output>")                               .appendTo(elements.dialog);
  }
  
  function _observe() {
    $document.on("keydown.modal_window", function(event) {
      var keyCode = event.keyCode;
      if (keyCode === 27) { // esc
        hide();
      }
    });
    
    elements.container.on("click.modal_window", function(event) {
      if (event.target === elements.container[0]) {
        hide();
      }
    });
    
    // Close modal window when user drags something on the shadow
    var blinker;
    
    droppable = {
      types:          protonet.ui.Droppables.FILES.concat(protonet.FILES_MIME_TYPE),
      elements:       elements.container,
      includeChilds:  false,
      ondragenter:    function() {
        blinker = protonet.effects.blink(elements.container, {
          interval: (0.25).seconds(),
          callback: function() { hide(); }
        });
      },
      ondragleave:    function() {
        blinker.stop();
      }
    };
    
    // protonet.ui.Droppables.add(droppable);
    
    $window
      .bind("scroll.modal_window", position)
      .bind("resize.modal_window", resize);
    
    protonet.on("modal_window.hide", hide);
  }
  
  function _unobserve() {
    $window
      .add($document)
      .add(elements.container)
      .unbind(".modal_window");
    
    protonet.ui.Droppables.remove(droppable);
    protonet.off("modal_window.hide", hide);
  }
  
  function _hideScrollbar() {
    var paddingRight = $body.cssUnit("padding-right")[0];
    scrollbarWidth = scrollbarWidth || protonet.utils.getScrollbarWidth();
    
    $body.css({
      "overflow-y":     "hidden",
      "overflow-x":     "hidden",
      "padding-right":  (paddingRight + scrollbarWidth).px()
    });
  }
  
  function _showScrollbar() {
    $body.css({
      "overflow-y":     "",
      "overflow-x":     "",
      "padding-right":  ""
    });
  }
  
  function _loadStylesheets(html, callback) {
    // Parse the given HTML for stylesheets, load them and turn them into inline
    // <style> elements
    var stylesheetsToLoad = 0;
    
    html = html.replace(regExpStylesheets, function(match, href) {
      if (protonet.utils.isSameOrigin(href)) {
        stylesheetsToLoad++;
        
        var placeholder = "<!--" + href + "-->";
        $.ajax(href).done(function(css) {
          html = html.replace(placeholder, "<style>\n" + css + "\n</style>");
          if (--stylesheetsToLoad === 0) {
            callback(html);
          }
        });
        return placeholder;
      } else {
        return match;
      }
    });
    
    if (stylesheetsToLoad === 0) {
      callback(html);
    }
  }
  
  function _loadViaAjax(url) {
    elements.dialog.addClass("loading");
    _abortCurrentRequest();
    
    currentRequest = $.ajax({
      url:  url,
      data: { ajax: 1 }
    }).done(function(response, statusText, xhr) {
      var contentType = xhr.getResponseHeader("Content-Type");
      if (contentType.startsWith("text/html")) {
        _loadStylesheets(response, function(html) {
          content(html, true);
          elements.dialog.removeClass("loading");
          protonet.trigger("modal_window.loaded", response, xhr);
        });
      } else if (contentType.startsWith("text/")) {
        content(response);
        elements.dialog.removeClass("loading");
        protonet.trigger("modal_window.loaded", response, xhr);
      } else {
        elements.dialog.removeClass("loading");
        protonet.trigger("modal_window.loaded", response, xhr);
      }
    }).fail(function(xhr) {
      var textResource;
      if (xhr.status === 403) {
        textResource = protonet.t("PAGE_ACCESS_FORBIDDEN");
        if (protonet.config.user_is_stranger) {
          textResource += " " + protonet.t("PLEASE_LOGIN");
        }
      } else if (xhr.status === 0) {
        // Request aborted
        return;
      } else {
        textResource = protonet.t("PAGE_LOADING_ERROR");
      }
      
      protonet.trigger("flash_message.error", textResource);
      elements.dialog.removeClass("loading");
    });
  }
  
  function _load(url) {
    content("", true);

    var fileType = protonet.utils.guessFileType(url);
    
    switch(fileType) {
      case "image":
        content(
          $("<img>", { src: url }), true
        );
        break;
      case "iframe":
      case "flash":
      case "audio":
      case "video":
        content(
          $("<iframe>", { src: url }), true
        );
        break;
      default:
        _loadViaAjax(url);
    }
  }
  
  function show(url) {
    if (!elements) {
      _create();
    }
    
    if (visible) {
      _fireUnload();
    } else {
      _observe();
      _hideScrollbar();
      elements.container.hide().appendTo($body).fadeIn("fast");
      position();
      resize();
      
      // Unfocus elements below the modal window
      $(".inner-body *:focus").not("header *").blur();
      
      visible = true;
    }
    
    if (url) {
      _load(url);
      try {
        // This could fail if the url is not same origin
        protonet.utils.History.push(url);
      } catch(e) {}
    } else {
      content("", true);
    }
    
    protonet.trigger("modal_window.shown");
    
    return this;
  }
  
  function hide() {
    if (!visible) {
      return this;
    }
    
    _fireUnload();
    elements.container.detach();
    content("");
    
    _showScrollbar();
    _unobserve();
    _abortCurrentRequest();
    
    visible = false;
    
    protonet.utils.History.push(urlBeforeOpened);
    protonet.trigger("modal_window.hidden");
    
    return this;
  }
  
  function append(content) {
    elements.content.append(content);
    return this;
  }
  
  function content(content, isHTML) {
    var $element = elements.content;
    if (isHTML) {
      $element.html(content);
    } else {
      $element.text(content);
    }
    $document.updateBehaviors();
    protonet.trigger("modal_window.rendered");
    return this;
  }
  
  function position() {
    var top = ($window.scrollTop() + offsetTop).px();
    elements.dialog.css("top", top);
    return this;
  }
  
  function resize(immediately) {
    var height = ($window.height() - (offsetTop + offsetBottom));
    elements.content.css("height", height);
    return this;
  }
  
  function isVisible() {
    return visible;
  }
  
  return {
    show:             show,
    hide:             hide,
    append:           append,
    content:          content,
    isVisible:        isVisible
  };
})();