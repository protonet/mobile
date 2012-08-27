//= require "../utils/is_server_reachable.js"
//= require "../../lib/jquery.quakeStyleConsole/jquery.quakeStyleConsole.js"

protonet.p("preferences", function($page) {
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
  
  $page.delegate("form.custom-css", "ajax:success", function() {
    var $customCss = $("#custom-css"),
        $style     = $("<style>", { text: $(this).find("textarea").val(), type: "text/css", id: "custom-css" });
    
    if ($customCss.length) {
      $customCss.replaceWith($style);
    } else {
      $("body").append($style);
    }
  });
  
  $page.delegate("form.custom-js", "ajax:success", function() {
    var script = $.trim($(this).find("textarea").val());
    
    if (script) {
      window.eval(script);
    }
  });
  
  $page.delegate("form.wifi, form.publish-to-web", "ajax:complete", function() {
    setTimeout(function() { $(this).find(".reload-link").click(); }.bind(this), (1).seconds());
  });
  
  function reloadPublishToWebStatus() {
    $page.find(".status-box.publish-to-web .reload-link").click();
  }
  
  $page.delegate("output[data-tab]", "tab:updated", reloadPublishToWebStatus);
  reloadPublishToWebStatus();
  
  // The quality of the following LOC is my ticket to hell.
  // Luckily Terry Tate isn't working for protonet (yet) http://www.youtube.com/watch?v=RzToNo7A-94
  // I'm sure I'll laugh about this as soon as I've my own helicopter. (Anonymous, 29/11/2011)
  // One day this should move into a $.events.special.online module
  (function() {
    if (!protonet.config.incoming_interface.startsWith("wlan")) {
      return;
    }
    
    var overlay,
        interval,
        showOverlay = function() {
          overlay = new protonet.ui.Dialog({
            "class":  "dialog small",
            headline: protonet.t("WLAN_UPDATE_HEADLINE"),
            text:     protonet.t("WLAN_UPDATE_TEXT")
          });
        },
        hideOverlay = function() {
          overlay && overlay.hide();
        };

    $page.delegate("form.wifi", "submit", function() {
      var hasBeenUnreachable;
      clearInterval(interval);
      interval = setInterval(function() {
        protonet.utils.isServerReachable(function(isReachable) {
          if (isReachable && hasBeenUnreachable) {
            hideOverlay();
            clearInterval(interval);
          } else if (!isReachable && !hasBeenUnreachable) {
            hasBeenUnreachable = true;
            showOverlay();
          }
        });
      }, 3000);
    });
  })();
  
  $page.on("ajax:complete", "form.software-update", function(event, xhr) {
    if (xhr.getResponseHeader("X-Error-Message")) {
      return;
    }
    
    // TODO: handle server failures
    // right now a completed request is always handled like a success
    new protonet.ui.Dialog({
      "class":  "dialog small",
      headline: protonet.t("SOFTWARE_UPDATE_HEADLINE"),
      text:     protonet.t("SOFTWARE_UPDATE_TEXT")
    });
    
    setTimeout(function() { location.href = "/"; }, (20).seconds());
    
    var progressConsole = $releaseUpdateProgressConsole.data("quakeStyleConsole");
    if (progressConsole) {
      progressConsole.close();
    }
    
    event.stopPropagation();
  });


  // release update log console
  
  var $showReleaseProgressButton = $("#show-release-update-progress");
  var $releaseUpdateProgressConsole = $("#release-update-progress-console");
  // the actual content area of the console. it would be cooler if the plugin would expose the element to be updated with content.
  var $releaseUpdateProgressConsoleContent = $releaseUpdateProgressConsole.find(".quake-style-console-content");
  var $showLastUpdateLog = $("#show-last-release-update-log");
  var $sendToProtonetSupport = $("#send-to-protonet-support");
  var getContentIsActive;
  // preparation uber sophisticated way to scroll down on console content growth
  var scrollTop = 1000000;
  
  // function getUpdateProgressLog - gets content from an url defined in the data attribute of the console-div
  // when timeoutTime is > 0 its called recursively after timeoutTime ms timeout
  // @param jQuery-Object $elementToUpdate - the jQuery-wrapped element to be updated with the content returned by the async request
  // @param int timeoutTime - ms to wait before next call
  function getUpdateProgressLog($elementToUpdate, timeoutTime) {
    $.ajax({
      url : $releaseUpdateProgressConsole.data("url"),
      dataType : 'json',
      success: function(response) {
        $elementToUpdate.text(response.text);
        if (getContentIsActive === false) {
          return;
        }
        if (timeoutTime > 0) {
         setTimeout(function() { getUpdateProgressLog($elementToUpdate, timeoutTime); }, timeoutTime); 
        }
        $releaseUpdateProgressConsoleContent.scrollTop(scrollTop + 1000000);
      }
    });
  }

  // update progress log
  $page.on("submit", "form.software-update", function() {
    $showReleaseProgressButton.fadeIn();
    $showReleaseProgressButton.unbind("click.showReleaseProgress").bind("click.showReleaseProgress", function(e) {
      e.preventDefault();
      $releaseUpdateProgressConsole.quakeStyleConsole({
        onopen: function() {
          getContentIsActive = true;
          getUpdateProgressLog($releaseUpdateProgressConsoleContent, 500);
          $showReleaseProgressButton.fadeOut();
        },
        onclose: function() {
          getContentIsActive = false;
          $showReleaseProgressButton.fadeIn();
        }
      });
      $releaseUpdateProgressConsole.data("quakeStyleConsole").open();
    });
  });
  
  // show old log
  $("#show-last-release-update-log").unbind(".showReleaseProgress").bind("click.showReleaseProgress", function(e) {
    e.preventDefault();
    var $this = $(this);
    $releaseUpdateProgressConsole.quakeStyleConsole({
      onopen: function() {
        $this.fadeOut();
        getContentIsActive = true;
        getUpdateProgressLog($releaseUpdateProgressConsoleContent, 0);
        $sendToProtonetSupport.fadeIn();
      },
      onclose: function() {
        $this.fadeIn();
        getContentIsActive = false;
        $sendToProtonetSupport.fadeOut();
      }
    });
    $releaseUpdateProgressConsole.data('quakeStyleConsole').open();
  });
  
});