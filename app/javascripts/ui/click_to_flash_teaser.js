// Check for flash placeholder
$(window).load(function() {
  setTimeout(function() {
    var flashPlaceholder = $("div.ujs_flashblock_placeholder, div[bginactive][bgactive]");
    flashPlaceholder.css({
      "border":             "5px solid white",
      "box-sizing":         "content-box",
      "-moz-box-sizing":    "content-box",
      "-webkit-box-sizing": "content-box",
      "width":              "auto",
      "height":             "auto",
      "min-width":          "90px",
      "min-height":         "90px",
      "margin-left":        "-50px",
      "position":           "absolute",
      "left":               "50%",
      "top":                "55px",
      "box-shadow":         "0 0 30px #000",
      "-moz-box-shadow":    "0 0 30px #000",
      "-webkit-box-shadow": "0 0 30px #000",
      "z-index":            "100"
    }).bind("DOMNodeRemoved", function() {
      setTimeout(function() {
        flashPlaceholder = $("div.ujs_flashblock_placeholder, div[bginactive][bgactive]");
        if (!flashPlaceholder.length) {
          overlay.remove();
        }
      }, 0);
    });

    if (flashPlaceholder.length) {
      var overlay = $("<div>").css({
        "background":       "rgba(255, 255, 255, 0.7) url(/img/click_to_flash_teaser.png) center 10px no-repeat ", 
        "z-index":          "99",
        "position":         "absolute",
        "top":              0,
        "left":             0,
        "width":            "100%",
        "height":           "100%"
      }).appendTo("body");
    }
  }, 100);
});