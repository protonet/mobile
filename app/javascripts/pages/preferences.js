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
  
  $page.delegate("form.wifi", "ajax:complete", function() {
    $(this).find(".reload-link").click();
  });
  
  $page.delegate("form.publish-to-web", "ajax:complete", function() {
    $("#preferences_publish_to_web_name").attr('readonly', $("form.publish-to-web input[type=radio]:checked").val() == "true");
  });
  
  $page.delegate("form.publish-to-web", "ajax:complete", function() {
    $(".reload-link").click();
  });
  
  
});