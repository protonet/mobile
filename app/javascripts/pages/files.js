//= require "../ui/files/list.js"
//= require "../ui/audio_player.js"
//= require "../utils/parse_query_string.js"
//= require "../lib/jquery.fullscreen.js"

protonet.p("files", function($page) {
  
  var $content      = $page.find(".content"),
      isModalWindow = $(".modal-window").length > 0;
  
  function resizePage() {
    if (!isModalWindow) {
      $content.css("height", $window.height() - $content.offset().top - 41 + "px");
    }
  }
  
  $window.on("resize", resizePage);
  resizePage();
  
  if (isModalWindow) {
    $page.one("modal_window.unload", function() {
      $window.off("resize", resizePage);
    });
  }
  
  new protonet.ui.files.List($page);
});




protonet.p("files-play", function($page) {
  var urls = protonet.utils.parseQueryString(location.search).urls || [];
  var audioPlayer = new protonet.ui.AudioPlayer(urls, { autoPlay: true });
  audioPlayer.renderInto($page);
  
  protonet.on("audio.add", function(urls) {
    audioPlayer.add(urls);
    
    var textResource;
    if (urls.length > 1) {
      textResource = protonet.t("AUDIO_PLAYER_SONGS_ADDED", { songs: urls.length });
    } else {
      textResource = protonet.t("AUDIO_PLAYER_SONG_ADDED");
    }
    protonet.trigger("flash_message.notice", textResource);
  });
  
  // Make sure that the parent window always knows about the existence of this popup
  setInterval(function() {
    if (window.opener) {
      window.opener.__audioPopup = window;
    }
  }, 500);
  
  if ($.browser.mozilla) {
    // >= Firefox 13
    $.support.fullscreen = !window.globalStorage;
  }
  
  if ($.support.fullscreen) {
    var $enterFullscreen = $("<a>", { "class": "enter-fullscreen", title: protonet.t("TOGGLE_FULLSCREEN_MODE") }).appendTo($page);
    $enterFullscreen.on("click", function() {
      $page.fullScreen({ background: "#f2f2f2" });
    });
  }
});