//= require "../lib/jquery.fcbkcomplete.js"

$.behaviors({
  "ul.remote-channel .text-extension-results.Meep a:click": function(element, event) {
    event.stopImmediatePropagation();
    event.preventDefault();
  },
  
  "a[data-channel-id]:dragstart": function(element, event) {
    if (event.dataTransfer) {
      var $element  = $(element),
          channelName = protonet.data.Channel.getName($element.data("channel-id"));
      if (channelName) {
        event.dataTransfer.clearData();
        event.dataTransfer.setData("Text", "@" + channelName + " ");
      }
    }
  },
  
  "a[data-user-id]:dragstart": function(element, event) {
    if (event.dataTransfer) {
      var $element  = $(element),
          userName  = protonet.data.User.getName($element.data("user-id"));
      if (userName) {
        event.dataTransfer.clearData();
        event.dataTransfer.setData("Text", "@" + userName + " ");
      }
    }
  },
  
  ".text-extension-results.Image a:click": function(element, event) {
    protonet.ui.ModalWindow.show(element.href);
    event.preventDefault();
  },
  
  // Needed in order to avoid the socket from disconnecting when a file gets downloaded
  // (which triggers the beforeunload/unload handlers in some browsers)
  "a[download]:click": (function() {
    var $iframe;
    return function(element, event) {
      $iframe = $iframe || $("<iframe style='width:0; height:0; border:0; display:none;'>");
      $iframe.appendTo(document.body).attr("src", element.href);
      event.preventDefault();
    };
  })(),
  
  "img[data-src]:inview": function(element) {
    var $element = $(element);
    $element.attr("src", $element.attr("data-src")).removeAttr("data-src");
  },
  
  "[data-contact-admin]:click": function(element, event) {
    protonet.trigger("rendezvous.start", protonet.data.User.getAvailableAdmin());
    event.preventDefault();
  },
  
  "[data-hover-hint]:mouseover": (function() {
    var $bubble;
    return function(element, event) {
      event.preventDefault();
      var $element = $(element);
      if ($element.data("original_title")) {
        return;
      }
      
      var direction = $element.data("hover-hint"),
          title     = $element.attr("title");
      
      $bubble = $bubble || $("<i>");
      $bubble[0].style.cssText = "";
      
      $bubble
        .attr("class", "hover-hint hover-hint-" + direction)
        .text(title)
        .appendTo("body");
      
      $element
        .data("original_title", title)
        .removeAttr("title")
        .bind("mouseleave click", function() {
          $bubble.detach();
          $element
            .attr("title", $element.data("original_title"))
            .data("original_title", null)
            .unbind("mouseleave click", arguments.callee);
        });
      
      var elementDimenisons = {
        width:  $element.outerWidth(),
        height: $element.outerHeight()
      };
      
      var bubbleDimensions = {
        width:  $bubble.outerWidth(),
        height: $bubble.outerHeight()
      };
      
      var elementPosition = $element.offset();
      
      if (direction === "right") {
        $bubble.css({
          left: (elementPosition.left + elementDimenisons.width).px(),
          top:  (elementPosition.top + (elementDimenisons.height / 2 - bubbleDimensions.height / 2)).px()
        });
      } else if (direction === "top") {
        $bubble.css({
          left: (elementPosition.left + (elementDimenisons.width / 2 - bubbleDimensions.width / 2)).px(),
          top:  (elementPosition.top - bubbleDimensions.height).px()
        });
      }
      $bubble.hide().fadeIn("fast");
    };
  })(),
  
  "select[data-multi-select]": function(element) {
    $(element).fcbkcomplete({addontab: true, width: "400px"});
  }
});

if (protonet.browser.IS_TOUCH_DEVICE()) {
  
  $.behaviors({
    "[tabindex]:touchstart": function(element, event) {
      if ($(element).is(":focus")) {
        event.stopImmediatePropagation();
      }
    },
    
    "[tabindex]:touchend": function(element) {
      var $element = $(element);
      if ($element.is("a, input, select, textarea, :focus")) {
        return;
      }
      
      $element.trigger("focus");
      $document.one("touchstart", function() {
        $element.trigger("blur");
      });
    }
  });
  
}

if (!protonet.browser.SUPPORTS_PLACEHOLDER()) {
  
  $.behaviors({
    "input[placeholder], textarea[placeholder]": function(input) {
      var $input = $(input);
      new protonet.utils.InlineHint($input, $input.attr("placeholder"));
    }
  });
  
}