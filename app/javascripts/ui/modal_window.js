//= require "../utils/get_scrollbar_width.js"

/**
 * Modal Window
 * 
 * @example
 *    new protonet.ui.ModalWindow().headline("My Headline").content("Lorem ipsum ...").show({
 *      // "my-modal-window" is a css class name which should be set on the dialog element
 *      // in order to make it targetable via css selectors
 *      className:    "my-modal-window"
 *    });
 */
protonet.ui.ModalWindow = (function() {
  var elements,
      current,
      scrollbarWidth,
      isTouchDevice = protonet.user.Browser.IS_TOUCH_DEVICE(),
      $body         = $(document.body),
      $document     = $(document),
      $window       = $(window);
  
  return Class.create({
    initialize: function(className) {
      this.visible = false;
      this.className = className;
    },
    
    _create: function() {
      if (!elements) {
        elements = {
          shadow:     $("<div>",    { className: "modal-window-shadow" }),
          dialog:     $("<div>",    { className: "modal-window-dialog" }),
          content:    $("<output>", { className: "modal-window-content" }),
          closeLink:  $("<a>",      { className: "modal-window-close-link close-link", html: "X" }),
          headline:   $("<h2>",     { html: "&nbsp;" })
        };
        elements.shadow.append(elements.dialog).appendTo($body);
        elements.closeLink.add(elements.headline).add(elements.content).appendTo(elements.dialog);
      }
      
      this.elements = elements;
    },
    
    _observe: function() {
      $document.bind("keydown.modal_window", function(event) {
        switch (event.keyCode) {
          case 38: // arrow down
          case 40: // arrow up
            event.preventDefault();
            break;
          case 27: // esc
            this.hide();
        }
      }.bind(this));

      $window
        .bind("mousewheel.modal_window", false)
        .bind("scroll.modal_window", this.position.bind(this))
        .bind("resize.modal_window", this.resize.bind(this));
      elements.shadow
        .bind("mousedown.modal_window", function(event) { event.preventDefault(); })
        .bind("click.modal_window", function(event) {
          if (event.target == elements.shadow[0]) { this.hide(); }
        }.bind(this));

      elements.closeLink.bind("click.modal_window", function() {
        this.hide();
      }.bind(this));
      
      elements.dialog.bind("mousedown.modal_window mousewheel.modal_window", function(event) { event.stopPropagation(); });
    },

    _unobserve: function() {
      $window
        .add($document)
        .add(elements.shadow)
        .add(elements.closeLink)
        .add(elements.dialog)
        .unbind(".modal_window");
    },
    
    headline: function(headline) {
      this._create();
      elements.headline.html(headline);
      this.resize(true);
      return this;
    },
    
    content: function(content) {
      this._create();
      elements.content.html(content);
      this.resize(true);
      return this;
    },
    
    show: function() {
      if (this.visible) {
        return;
      }
      
      if (current) {
        var alreadyVisible = true;
        current.cleanup();
      }
      current = this;
      
      this._create();
      this._observe();

      elements.dialog.addClass(this.className);
      if (isTouchDevice || alreadyVisible) {
        elements.shadow.show();
      } else {
        elements.shadow.fadeIn("fast");
      }
      
      var originalPaddingRight = $body.css("padding-right");
      scrollbarWidth = scrollbarWidth || protonet.utils.getScrollbarWidth();
      
      $body.css({
        "overflow-y":     "hidden",
        "padding-right":  (parseInt(originalPaddingRight, 10) + scrollbarWidth).px()
      });
      
      var focusedElement = $(":focus");
      if (focusedElement.length && !$.contains(elements.shadow[0], focusedElement[0])) {
        focusedElement.blur();
      }
      
      this.position();
      this.resize();
      
      this.visible = true;
      
      return this;
    },

    hide: function() {
      if (!this.visible) {
        return;
      }
      
      $body.css({
        "overflow-y":     "",
        "padding-right":  ""
      });
      
      elements.shadow.hide();
      this.cleanup();
      
      return this;
    },
    
    cleanup: function() {
      current = null;
      this.headline("");
      this.content("");
      this._unobserve();
      this.visible = false;
      elements.dialog.removeClass(this.className);
    },
    
    position: function(immediately) {
      immediately = immediately || isTouchDevice; // iPad is very slow... let's skip the effect
      var top = ($window.scrollTop() + 50).px();
      if (immediately === true) {
        elements.dialog.css("top", top);
      } else {
        elements.dialog.stop(true).delay(500).animate({ top: top }, 500);
      }
      return this;
    },

    resize: function(immediately) {
      immediately = immediately || isTouchDevice; // iPad is very slow... let's skip the effect
      var height = ($window.height() - 2 * 50 - elements.headline.outerHeight());
      height = Math.max(180, height).px();
      if (immediately === true) {
        elements.content.css("height", height);
      } else {
        elements.content.stop(true).delay(500).animate({ height: height }, 500, function() {
          elements.content.css({ overflow: "" });
        });
      }
      return this;
    }
  });
})();