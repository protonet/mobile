//= require "../media/webcam.js" 

protonet.p("snapshots", function($page) {
  var photoUrl,
      uploadUrl     = protonet.config.node_base_url
        + "/fs/snapshot"
        + "?user_name=" + encodeURIComponent(protonet.config.user_name)
        + "&user_id="   + encodeURIComponent(protonet.config.user_id),
      $container    = $page.find("output"),
      $urlInput     = $page.find("input"),
      $label        = $page.find("label"),
      $snapBar      = $container.find("div"),
      $snapButton   = $page.find("a.snap"),
      $retryButton  = $page.find("button.retry"),
      $shareButton  = $page.find("button.share");
  
  function failure() {
    protonet.trigger("flash_message.error", protonet.t("NO_WEBCAM_SUPPORT"));
  }
  
  var webcam = new protonet.media.Webcam();
  if (!webcam.supported()) {
    failure();
    return;
  }
  webcam.insertInto($container);
  
  $snapButton.bind("click", function() {
    $snapBar.hide();
    webcam.snap(uploadUrl, function(response) {
      photoUrl = protonet.data.File.getDownloadUrl(response[0]);
      $label.css("display", "block");
      $urlInput.val(photoUrl).select();
      $page.find("button").toggle();
      protonet.trigger("snapshot:done", photoUrl);
    });
  });
  
  $retryButton.bind("click", function() {
    webcam.reset();
    $snapBar.show();
    $label.hide();
    $page.find("button").toggle();
  });
  
  $shareButton.bind("click", function() {
    location.href = "/?url=" + encodeURIComponent(photoUrl);
  });
});
