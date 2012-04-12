//= require "../utils/is_same_origin.js"

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
    // Files that are meant to be downloaded instead of displayed
    "[download]",
    // User profile links
    "[data-user-id]",
    "[data-tab]",
    // rails.js
    "[data-remote]",
    "[data-method]"
  ].join(",");
  
  var isTouchDevice = protonet.browser.IS_TOUCH_DEVICE();
  
  var matchesSelector = Element.prototype.matchesSelector || function(selector) { return $(this).is(selector); };

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
    
    if (!protonet.config.allow_modal_views || isTouchDevice) {
      return fallback(eventOrUrl);
    }

    if (isEvent && isBlackListed(link)) {
      return fallback(eventOrUrl);
    }
    
    if (!protonet.utils.isSameOrigin(url)) {
      return fallback(eventOrUrl);
    }
    
    if (link.pathname === "/" || !link.pathname) {
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
    if (event.isDefaultPrevented()) {
      return;
    }
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
    var $form = $(event.target);
    $form
      .addClass("loading")
      .find("input, textarea, select, button")
        .prop("disabled", !$form.data("avoid-disabling"))
        .end()
      .find(".loading-hint")
        .fadeIn("fast");
  },
  
  ".subpage:ajax:complete": function(element, event, xhr) {
    var flashMessageSet,
        status = xhr.status,
        html   = xhr.responseText,
        contentType = xhr.getResponseHeader('Content-Type');
    
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
      if (!html || !contentType.match(/text|html/) ) { return; }
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
    if (event.isDefaultPrevented()) {
      return;
    }
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
      data:     { ajax: 1 },
      beforeSend: function() {
        var hint = $("<p>", { "class": "hint", text: protonet.t("LOADING") });
        $tabContainer.html(hint);
        
        $tabLinks.parent().removeClass("selected");
        $tabLink.parent().addClass("selected");
        protonet.utils.History.push(url);
      },
      success: function(html, statusText, xhr) {
        var $output = $(html).find("output[data-tab]");
        if ($output.length > 0) {
          html = $output.html();
          $tabContainer.attr("class", $output.attr("class"));
          var classNames = $output.parents("section.subpage").attr("class");
          $tabContainer.parents("section.subpage").attr("class", classNames);
        }
        $tabContainer.html(html).hide().fadeIn("fast");
        $tabContainer.css("padding-top", (originalPaddingTop + $scrollContainer.scrollTop()).px());
        $tabContainer.trigger("tab:updated");
      }
    });
    event.preventDefault();
  }
});