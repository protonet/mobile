//= require "../utils/is_same_origin.js"
//= require "../utils/guess_file_type.js"

/**
 * AJAX Page Loads and Form Submits
 */
protonet.open = (function() {
  // Ignore elements that match the following css selectors
  var blackList = [
    // General flag
    "[data-avoid-ajax]",
    // Channel switcher
    "[data-channel-id]",
    "[data-meep-share]",
    "[data-rendezvous-with]",
    "[data-reply-to]",
    // User profile links
    "[data-user-id]",
    "[data-tab]",
    // rails.js
    "[data-remote]",
    "[data-method]",
    // File widget
    "#file-widget a"
  ].join(",");

  var prototype = Element.prototype || {};

  var matchesSelector = prototype.matchesSelector
    || prototype.webkitMatchesSelector
    || prototype.mozMatchesSelector
    || prototype.oMatchesSelector
    || prototype.msMatchesSelector
    || function(selector) { return $(this).is(selector); };

  var isBlackListed = function(link) {
    return matchesSelector.call(link, blackList);
  };
  
  var fallback = function(eventOrUrl) {
    if (typeof(eventOrUrl) === "string") {
      location.href = eventOrUrl;
    }
  };
  
  return function(eventOrUrl) {
    var isEvent = typeof(eventOrUrl) === "object",
        link    = isEvent ? eventOrUrl.currentTarget : (function() {
          var a = document.createElement("a");
          a.href = eventOrUrl;
          return a;
        })(),
        url     = link.href;
    
    if (!protonet.config.allow_modal_views) {
      return fallback(eventOrUrl);
    }

    if (isEvent && isBlackListed(link)) {
      return fallback(eventOrUrl);
    }
    
    if (!protonet.utils.isSameOrigin(url) && !url.startsWith(protonet.config.node_base_url)) {
      return fallback(eventOrUrl);
    }
    
    if (link.pathname === "/" || !link.pathname) {
      return fallback(eventOrUrl);
    }

    // could be: audio, html, video, ... (see guess_file_type.js)
    var fileType = protonet.utils.guessFileType(url).type;
    if (fileType === "unknown") {
      return fallback(eventOrUrl);
    }

    if (!protonet.ui.ModalWindow.supportsFileType(fileType)) {
      return fallback(eventOrUrl);
    }
    
    if (document.querySelector(".subpage") && !protonet.ui.ModalWindow.isVisible()) {
      return fallback(eventOrUrl);
    }
    
    protonet.ui.ModalWindow.show(url);
    
    if (isEvent) {
      eventOrUrl.preventDefault();
    }
  };
})();


/**
 * Call protonet.open("...")
 * If no other mechanism knows what to do with the path
 */
protonet.utils.History.addFallback(protonet.open);


$.behaviors({
  "a[href]:click": function(link, event) {
    protonet.open(event);
  },
  
  "form[data-ajax-auto-submit]:change": function(form, event) {
    var $target = $(event.target),
        $form   = $(form);
    
    $.ajax({
      type: $form.attr("method"),
      url:  $form.attr("action"),
      data: $form.serialize(),
      beforeSend: function() {
        $target.prop("disabled", true).parents(".checkbox-row").addClass("loading");
      },
      success:function(response) {
        protonet.trigger("flash_message.notice", protonet.t("FORM_SUBMIT_SUCCESS"));
      },
      error: function(response) {
        protonet.trigger("flash_message.error", protonet.t("FORM_SUBMIT_ERROR"));
      },
      complete: function() {
        $target.prop("disabled", false).parents(".checkbox-row").removeClass("loading");
      }
    });
  },
  
  ".subpage:ajax:beforeSend": function(element, event) {
    $(event.target)
      .addClass("loading")
      .find("input, textarea, select, button")
        .prop("disabled", true)
        .end()
      .find(".loading-hint")
        .fadeIn("fast");
  },
  
  ".subpage:ajax:complete": function(element, event, xhr) {
    var flashMessageSet,
        status = xhr.status,
        html   = xhr.responseText;
    
    $(event.target)
      .removeClass("loading")
      .find("input, textarea, select, button")
        .prop("disabled", false)
        .end()
      .find(".loading-hint")
        .hide();
    $.each({
      "X-Error-Message":  "flash_message.error",
      "X-Notice-Message": "flash_message.notice",
      "X-Sticky-Message": "flash_message.sticky"
    }, function(header, eventName) {
      var message = xhr.getResponseHeader(header);
      if (message) {
        protonet.trigger(eventName, message);
        flashMessageSet = true;
      }
    });
    
    if (status >= 200 && status < 300 || status === 304) {
      if (!html) { return; }
      $(element).replaceWith(html);
      var newUrl = xhr.getResponseHeader("X-Url");
      newUrl && protonet.utils.History.push(newUrl);
    } else if (!flashMessageSet) {
      if (status === 403) {
        protonet.trigger("flash_message.error", protonet.t("NO_RIGHTS_ERROR"));
      } else {
        protonet.trigger("flash_message.error", protonet.t("FORM_SUBMIT_ERROR"));
      }
    }
  },
  
  /**
   * @example
   *    <nav>
   *      <a href="/channels/1" data-tab="channel-container"></a>
   *      <a href="/channels/2" data-tab="channel-container"></a>
   *    </nav>
   *    <output data-tab="channel-container"></output>
   */
  "a[data-tab]:click": function(tabLink, event) {
    var $tabLink            = $(tabLink),
        tabName             = $tabLink.data("tab"),
        url                 = $tabLink.prop("href"),
        $tabContainer       = $("output[data-tab='" + tabName + "']"),
        $scrollContainer    = $(".modal-window > output:visible"),
        $tabLinks           = $("a[data-tab='" + tabName + "']"),
        originalPaddingTop  = (function() {
          var paddingTop = $tabContainer.data("original-padding-top");
          if (typeof(paddingTop) === "undefined") {
            paddingTop = $tabContainer.cssUnit("padding-top")[0];
            $tabContainer.data("original-padding-top", paddingTop);
          }
          return paddingTop;
        })();
    
    $.ajax({
      url:      $tabLink.prop("href"),
      headers:  { "X-Request-Type": "tab" },
      beforeSend: function() {
        var hint = $("<p>", { "class": "hint", text: protonet.t("LOADING") });
        $tabContainer.html(hint);
        
        $tabLinks.parent().removeClass("selected");
        $tabLink.parent().addClass("selected");
        protonet.utils.History.push(url);
      },
      success: function(html) {
        $tabContainer.html(html).hide().fadeIn("fast");
        $tabContainer.css("padding-top", (originalPaddingTop + $scrollContainer.scrollTop()).px());
      }
    });
    event.preventDefault();
  }
});