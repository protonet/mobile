//= require "../ui/overlay.js"
//= require "../utils/is_server_reachable.js"

$(function() {
  var $page = $(".preferences-page");
  
  $page.delegate("a.reload-link", "click", function() {
    var $link         = $(this),
        $container    = $link.parents(".status-box"),
        interfaceName = $container.data("interface");

    if ($link.is(".reloading")) {
      return;
    }

    $link.addClass("reloading");

    $.ajax({
      url:      $link.data('refresh-url'),
      cache:    false,
      data:     { "interface": interfaceName },
      success:  function(html) { $container.html(html); }
    });
    
    return false;
  });
  
  $page.delegate("form.wifi, form.publish-to-web", "ajax:complete", function() {
    setTimeout(function() { $(this).find(".reload-link").click(); }.bind(this), 500);
  });
  
  $page.find(".status-box.publish-to-web .reload-link").click();
  
  
  // The quality of the following LOC is my ticket to hell.
  // Luckily Terry Tate isn't working for protonet (yet) http://www.youtube.com/watch?v=RzToNo7A-94
  // I'm sure I'll laugh about this as soon as I've my own helicopter. (Anonymous, 29/11/2011)
  // One day this should move into a $.events.special.online module
  (function() {
    if (!protonet.config.incoming_interface.startsWith("wlan")) {
      return;
    }
    
    var overlay,
        interval,
        showOverlay = function() {
          overlay = new protonet.ui.Overlay(protonet.t("WLAN_UPDATED"));
        },
        hideOverlay = function() {
          overlay && overlay.hide();
        };

    $page.delegate("form.wifi", "submit", function() {
      var hasBeenUnreachable;
      clearInterval(interval);
      interval = setInterval(function() {
        protonet.utils.isServerReachable(function(isReachable) {
          if (isReachable && hasBeenUnreachable) {
            hideOverlay();
            clearInterval(interval);
          } else if (!isReachable && !hasBeenUnreachable) {
            hasBeenUnreachable = true;
            showOverlay();
          }
        });
      }, 3000);
    });
  })();
  
  
  (function() {
    var interval;
    $page.delegate("form.software-update", "ajax:complete", function(event, xhr) {
      if (xhr.getResponseHeader("X-Error-Message")) {
        return;
      }

      var hasBeenUnreachable;
      clearInterval(interval);
      interval = setInterval(function() {
        protonet.utils.isServerReachable(function(isReachable) {
          if (isReachable && hasBeenUnreachable) {
            clearInterval(interval);
            location.href = "/";
          } else if (!isReachable && !hasBeenUnreachable) {
            hasBeenUnreachable = true;
            new protonet.ui.Overlay(protonet.t("SOFTWARE_UPDATE_SUCCESSFUL"));
          }
        });
      }, 3000);
      
      event.stopPropagation();
    });
  })();
});