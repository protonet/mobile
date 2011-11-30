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
  
  if (protonet.config.incoming_interface.startsWith("wlan")) {
    var overlay,
        interval,
        showOverlay = function() {
          overlay = new protonet.ui.Overlay(protonet.t("WLAN_UPDATED"));
        },
        hideOverlay = function() {
          overlay && overlay.hide();
        };
    
    // The quality of the following LOC is my ticket to hell.
    // I'm sure I'll laugh about this as soon as I've my own helicopter. (Anonymous, 29/11/2011)
    // One day this should move into a $.events.special.online module
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
  }
});