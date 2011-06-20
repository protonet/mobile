// Check for flash placeholder
$(window).load(function() {
  var selector = "div.ujs_flashblock_placeholder, div[bginactive][bgactive], div[style*='gofhjkjmkpinhpoiabjplobcaignabnl']";
  
  // setTimout needed, since some flash blocker take a bit longer than window.onload to init
  setTimeout(function() {
    var flashPlaceholder = $(selector).map(function() {
      var element = this;
      if (this.style.cssText.indexOf("gofhjkjmkpinhpoiabjplobcaignabnl") != -1) {
        element = element.parentNode;
      }
      // Filter flash block placeholder that replace swfobject dummy elements
      var nextSibling                 = element.nextSibling || {},
          nextSiblingIsSwfObjectDummy = nextSibling.nodeName == "OBJECT" && !nextSibling.data;
      if (nextSiblingIsSwfObjectDummy) {
        element.parentNode.removeChild(element);
        return null;
      }
      return element;
    });
    
    if (!flashPlaceholder.length) {
      return;
    }
    
    var interval = setInterval(function() {
      flashPlaceholder.css({
        "border":             "5px solid white",
        "box-sizing":         "content-box",
        "-moz-box-sizing":    "content-box",
        "-webkit-box-sizing": "content-box",
        "width":              "90px",
        "height":             "90px",
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
      });
    }, 50);
    
    flashPlaceholder.bind("DOMNodeRemoved", function() {
      setTimeout(function() {
        flashPlaceholder = $(selector);
        if (!flashPlaceholder.length) {
          clearInterval(interval);
          overlay.remove();
        }
      }, 0);
    });
    
    var overlay = $("<div>").css({
      "background": "rgba(255, 255, 255, 0.7) url(/img/click_to_flash_teaser.png) center 10px no-repeat ", 
      "z-index":    "99",
      "position":   "absolute",
      "top":        0,
      "left":       0,
      "width":      "100%",
      "height":     "100%"
    }).addClass("click-to-flash-teaser").appendTo("body");
  }, 100);
});