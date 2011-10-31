//= require "../utils/get_scrollbar_width.js"

/**
 * Modal Window
 * 
 * @example
 *    protonet.ui.ModalWindow.show().content("Lorem ipsum ...");
 */

protonet.ui.ModalWindow = (function() {
  var elements,
      scrollbarWidth,
      currentRequest,
      urlBeforeOpened               = location.href,
      // Margin top and bottom (TODO: extract this logic to a css file)
      offset                        = 40,
      visible                       = false,
      embedMapping                  = {
        "image":    "image",
        "pdf":      "iframe",
        "flash":    "iframe",
        "html":     "xhr",
        "text":     "xhr",
        "unknown":  "xhr"
      },
      // Needed to preload stylesheets before rendering the corresponding HTML
      regExpStylesheets             = /<link.*\shref=(?:\"|')([^>"]+?\.css(?:\?.+?)?)(?:\"|')[^>]+>/gi,
      // Cached references
      $body                         = $(document.body),
      $document                     = $(document),
      $window                       = $(window);
  
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
    elements.dialog     = $("<section>",  { "class": "modal-window" })                .appendTo(elements.container);
    elements.closeLink  = $("<a>",        { "class": "close-link", html: "&times;" }) .appendTo(elements.dialog);
    elements.content    = $("<output>")                                               .appendTo(elements.dialog);
  }
  
  function _observe() {
    $document.bind("keydown.modal_window", function(event) {
      var keyCode = event.keyCode;
      if (keyCode === 27) { // esc
        hide();
      }
    });
    
    elements.container.bind("click.modal_window", function(event) {
      if (event.target === elements.container[0]) {
        hide();
      }
    });
    
    $window.bind("resize.modal_window", resize);
    
    elements.closeLink.bind("click.modal_window", hide);
    
    protonet.on("modal_window.hide", hide);
  }
  
  function _unobserve() {
    $window
      .add($document)
      .add(elements.container)
      .add(elements.closeLink)
      .unbind(".modal_window");
    
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
        $.ajax({
          url:     href,
          success: function(css) {
            html = html.replace(placeholder, "<style>\n" + css + "\n</style>");
            if (--stylesheetsToLoad === 0) {
              callback(html);
            }
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
      url:     url,
      data:    { ajax: 1 },
      success: function(response, statusText, xhr) {
        var contentType = xhr.getResponseHeader("Content-Type");
        if (contentType.startsWith("text/html")) {
          _loadStylesheets(response, function(html) {
            content(html, true);
            elements.dialog.removeClass("loading");
          });
        } else if (contentType.startsWith("text/")) {
          content(response);
          elements.dialog.removeClass("loading");
        }
      },
      error: function() {
        protonet.trigger("flash_message.error", protonet.t("PAGE_LOADING_ERROR"));
        elements.dialog.removeClass("loading");
      },
      timeout: 15000
    });
  }
  
  function _load(url) {
    content("", true);
    
    var fileType = protonet.utils.guessFileType(url).type;
    
    switch(fileType) {
      case "image":
        content(
          $("<img>", { src: url }), true
        );
        break;
      case "iframe":
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
    
    if (!visible) {
      _observe();
      _hideScrollbar();
      elements.container.hide().appendTo($body).fadeIn("fast");
      position();
      resize();
      
      // Unfocus elements below the modal window
      $(":focus:not(.modal-window *, body)").blur();
      
      visible = true;
    }
    
    if (url) {
      _load(url);
      protonet.utils.History.push(url);
    }
    
    return this;
  }
  
  function hide() {
    if (!visible) {
      return this;
    }
    
    elements.container.detach();
    content("");
    
    _showScrollbar();
    _unobserve();
    _abortCurrentRequest();
    
    visible = false;
    
    protonet.utils.History.push(urlBeforeOpened);
    
    return this;
  }
  
  function content(content, isHTML) {
    var $element = elements.content;
    if (isHTML) {
      $element.html(content);
    } else {
      $element.text(content);
    }
    return this;
  }
  
  function position() {
    var top = ($window.scrollTop() + offset).px();
    elements.dialog.css("top", top);
    return this;
  }
  
  function resize(immediately) {
    var height = ($window.height() - 2 * offset);
    elements.content.css("height", height);
    return this;
  }
  
  function supportsFileType(fileType) {
    return !!embedMapping[fileType];
  }
  
  function isVisible() {
    return visible;
  }
  
  
  return {
    show:             show,
    hide:             hide,
    content:          content,
    supportsFileType: supportsFileType,
    isVisible:        isVisible
  };
})();