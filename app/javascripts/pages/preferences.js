//= require "../ui/overlay.js"

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
    var $overlay,
        timeout,
        $window = $(window),
        showOverlay = function() {
          $overlay = new protonet.ui.Overlay(protonet.t("WLAN_UPDATED"));
        },
        hideOverlay = function() {
          $overlay && $overlay.hide();
        };
    
    $page.delegate("form.wifi", "submit", function() {
      if ("onLine" in navigator) {
        $window
          .unbind(".wifi")
          .one("offline.wifi", showOverlay)
          .one("online.wifi", function() {
            $window.unbind(".wifi");
            hideOverlay();
          });
      } else {
        timeout = setTimeout(showOverlay, 6000);
      }
    });
    
    $page.delegate("form.wifi", "ajax:complete", function() {
      clearTimeout(timeout);
      $window.unbind(".wifi");
      hideOverlay();
    });
  }
});