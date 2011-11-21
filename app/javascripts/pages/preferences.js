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
});