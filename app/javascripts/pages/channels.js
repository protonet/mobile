protonet.p("channels-index", function($page) {
  var $globalChannelContainer = $page.find("[data-recommended-global-channels]"),
      $loadingIndicator       = $globalChannelContainer.next(".progress");
  
  $globalChannelContainer.bind("inview", function() {
    $globalChannelContainer.unbind("inview");
    $.ajax({
      url: "/channels/recommended_global_teaser",
      beforeSend: function() {
        $loadingIndicator.show();
      },
      complete: function() {
        $loadingIndicator.hide();
      },
      success: function(html) {
        $globalChannelContainer.html(html);
      }
    });
  });
});