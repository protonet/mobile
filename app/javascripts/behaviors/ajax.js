//= require "../utils/is_same_origin.js"

/**
 * AJAX Page Loads and Form Submits
 */
protonet.open = (function() {
  // Ignore elements that match the following css selectors
  var selectorBlackList = [
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
    // rails.js
    "[data-remote]",
    "[data-method]"
  ].join(",");
  
  var pathBlackList = [
    "/users/sign_in",
    "/users/sign_up",
    "/users/password/new"
  ];
  
  var isTouchDevice = protonet.browser.IS_TOUCH_DEVICE();
  
  var matchesSelector = Element.prototype.matchesSelector || function(selector) { return $(this).is(selector); };

  var isBlackListed = function(link) {
    return matchesSelector.call(link, selectorBlackList);
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
    
    if (!protonet.utils.isSameOrigin(url)) {
      return fallback(eventOrUrl);
    }
    
    if (pathBlackList.indexOf(link.pathname) !== -1) {
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
  
  ".subpage:ajax:before": function(element, event){
    var $form = $(event.target),
        submitButtonName = $form.data("ujs:submit-button");
        
    if (!$form.data("avoid-disabling") && submitButtonName) {
      $form.find("[name="+submitButtonName.name+"]").addClass("loading");
    }
  },
  
  ".subpage:ajax:beforeSend": function(element, event) {
    var $form = $(event.target);
    
    $form
      .addClass("loading")
      .find("input, textarea, select")
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
        .hide()
        .end()
      .find(".loading")
        .removeClass("loading");
        
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
      $document.updateBehaviors();
    } else if (!flashMessageSet) {
      if (status === 403) {
        protonet.trigger("flash_message.error", protonet.t("NO_RIGHTS_ERROR"));
      } else {
        protonet.trigger("flash_message.error", protonet.t("FORM_SUBMIT_ERROR"));
      }
    }
  }
});