//= require "../utils/get_channel_name.js"

$.behaviors({
  "ul.remote-channel .text-extension-results.Meep a:click": function(element, event) {
    event.stopImmediatePropagation();
    event.preventDefault();
  },
  
  "a[data-channel-id]:dragstart": function(element, event) {
    if (event.originalEvent.dataTransfer) {
      var $element  = $(element),
          channelId = $element.data("channel-id");
      event.originalEvent.dataTransfer.setData("Text", "@" + protonet.utils.getChannelName(channelId) + " ");
    }
  },
  
  "a[data-user-id]:dragstart": function(element, event) {
    if (event.originalEvent.dataTransfer)  {
      var $element  = $(element),
          user      = protonet.user.getUser(+$element.data("user-id"));
      if (user) {
        event.originalEvent.dataTransfer.setData("Text", "@" + user.name + " ");
      }
    }
  },
  
  "img[data-src]:inview": function(element) {
    var $element = $(element);
    $element.attr("src", $element.attr("data-src")).removeAttr("data-src");
  },
  
  "[data-contact-admin]:click": (function() {
    var onlineUserIds = [],
        adminUserIds  = protonet.config.admin_ids || [];
    
    // TODO: someday we should add user.came_online and user.goes_offline here
    protonet
      .on("users.update_status", function(data) {
        onlineUserIds = Object.keys(data.online_users);
      })
      
      .on("users.update_admin_status", function(data) {
        adminUserIds = data.admin_ids;
      });
    
    return function(element, event) {
      var i = 0, onlineAdminUserId = adminUserIds[0];
      for (; i<adminUserIds.length; i++) {
        if (onlineUserIds.indexOf(adminUserIds[i]) !== -1) {
          onlineAdminUserId = adminUserIds[i];
          break;
        }
      }
      protonet.trigger("rendezvous.start", onlineAdminUserId);
      event.preventDefault();
    };
  })(),
  
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
  })()
});

if (protonet.user.Browser.IS_TOUCH_DEVICE()) {
  
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
      $(document).one("touchstart", function() {
        $element.trigger("blur");
      });
    }
  });
  
}

if (!protonet.user.Browser.SUPPORTS_PLACEHOLDER()) {
  
  $.behaviors({
    "input[placeholder], textarea[placeholder]": function(input) {
      var $input = $(input);
      new protonet.utils.InlineHint($input, $input.attr("placeholder"));
    }
  });
  
}