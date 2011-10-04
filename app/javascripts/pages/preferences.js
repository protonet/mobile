$(document).undelegate("a.reload-link").delegate("a.reload-link", "click", function(event) {
  event.preventDefault();
  event.stopPropagation();
  
  var $link         = $(this),
      $container    = $link.parents(".status-box"),
      interfaceName = $container.data("interface");
  
  if ($link.is(".reloading")) {
    return;
  }
  
  $link.addClass("reloading");
  
  $.ajax({
    url: "/preferences/wifi/interface_status",
    cache: false,
    data: { "interface": interfaceName },
    success: function(html) {
      $container.html(html);
    }
  });
});