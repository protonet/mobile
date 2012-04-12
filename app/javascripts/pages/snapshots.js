//= require "../lib/webcam.js"

$(function() {
  var photoUrl,
      $page         = $(".snapshots-page"),
      $container    = $page.find("output"),
      $urlInput     = $page.find("input"),
      $label        = $page.find("label"),
      $snapButton   = $page.find("button.snap"),
      $retryButton  = $page.find("button.retry"),
      $shareButton  = $page.find("button.share");
  
  webcam.set_swf_url("/flash/webcam.swf");
  webcam.set_shutter_sound(true, "/sounds/shutter.mp3");
  webcam.set_quality(100);
  
  $container.html(webcam.get_html($container.width(), $container.height()));
  
  $snapButton.bind("click", function() {
    $snapButton.addClass("loading").prop("disabled", true);
    webcam.snap(protonet.config.node_base_url + "/snapshooter", function(url) {
      $snapButton.removeClass("loading").prop("disabled", false);
      photoUrl = protonet.config.base_url + url;
      $label.css("display", "block");
      $urlInput.val(photoUrl).select();
      $page.find("button").toggle();
      protonet.trigger("snapshot:done", photoUrl);
    });
  });
  
  $retryButton.bind("click", function() {
    webcam.reset();
    $label.hide();
    $page.find("button").toggle();
  });
  
  $shareButton.bind("click", function() {
    location.href = "/?url=" + encodeURIComponent(photoUrl);
  });
});
