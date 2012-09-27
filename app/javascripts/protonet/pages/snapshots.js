protonet.p("snapshots", function($page) {
  var photoUrl,
      isModalWindow = !!$(".modal-window").length,
      uploadUrl     = protonet.config.node_base_url
        + "/fs/snapshot"
        + "?user_name=" + encodeURIComponent(protonet.config.user_name)
        + "&user_id="   + encodeURIComponent(protonet.config.user_id)
        + "&token="     + encodeURIComponent(protonet.config.token),
      $container    = $page.find("output"),
      $urlInput     = $page.find("input"),
      $label        = $page.find("label"),
      $snapBar      = $container.find("div"),
      $snapButton   = $page.find("a.snap"),
      $retryButton  = $page.find("button.retry"),
      $shareButton  = $page.find("button.share");
  
  function failure() {
    protonet.trigger("flash_message.error", protonet.t("snapshots.hint_no_webcam"));
  }
  
  function resizePage() {
    $container.css("height", $window.height() - $container.offset().top - 1 + "px");
  }
  
  if (!isModalWindow) {
    $window.on("resize", resizePage);
    resizePage();
  }
  
  var webcam = new protonet.media.Webcam();
  if (!webcam.supported()) {
    failure();
    return;
  }
  
  webcam.insertInto($container);
  
  $snapButton.bind("click", function() {
    $snapBar.hide();
    webcam.snapWithCountdown(uploadUrl, function(response) {
      photoUrl = protonet.data.File.getUrl(response.path);
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
