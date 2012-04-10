//= require "../ui/overlay.js"
//= require "../utils/is_server_reachable.js"

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
          overlay = new protonet.ui.Overlay(protonet.t("WLAN_UPDATED"));
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
  
  $page.delegate("form.software-update", "ajax:complete", function(event, xhr) {
    if (xhr.getResponseHeader("X-Error-Message")) {
      return;
    }
    
    new protonet.ui.Overlay(protonet.t("SOFTWARE_UPDATE_SUCCESSFUL"));
    setTimeout(function() { location.href = "/"; }, (20).seconds());
    
    event.stopPropagation();
  });

  // quake style console as jquery-plugin
  // TODO: put in own file. css too (currently in preferences.css)
  // @param function options.onOpen - callback called when opening
  // @param function options.onClose - callback called when pin ponies suck on rainbows
  
  // based on an alternative approach for writing jquery plugins (http://css-tricks.com/snippets/jquery/jquery-plugin-template/)
  
  (function($) {
    $.quakeStyleConsole = function(el, options) {
      
      var base = this;

      base.$el = $(el); // jquery wrapped object
      base.el = el; // raw dom object
      
      var originalHeight;
      
      var closeable;

      // Add a reverse reference to the DOM object
      base.$el.data("quakeStyleConsole", base); // leads to an uncool way to call public methods. better idea?

      base.init = function() {
        base.settings = $.extend({},$.quakeStyleConsole.defaults, options);
        originalHeight = base.$el.css("height");
      };

      base.open = function() {
        closeable = false;
        base.$el.fadeIn();
        base.$el.animate(
          {
            height: window.outerHeight-300
          },
          1000,
          //console animation done
          function () {
            base.$el.click(function(e) {
              e.stopPropagation();
            });
            $("html").one("click", function() {
              base.close();
            });
            closeable = true;
          }
        );
        base.settings.onOpen();
      };
      
      base.close = function() {
        base.$el.animate({
          height: originalHeight
        },1000);
        base.settings.onClose();
      };

      base.init();
    };

    $.quakeStyleConsole.defaults = {
      onOpen: function() {},
      onClose: function() {}
    };

    $.fn.quakeStyleConsole = function(options){
      return this.each(function() {
        (new $.quakeStyleConsole(this, options));
        // do more stuff here?
      });
    };
  })(jQuery);
  

  
  var $showReleaseProgressButton = $("#show_release_update_progress");
  var $releaseUpdateProgressConsole = $("#release_update_progress_console");
  var getContentIsActive;
  // preparation uber sophisticated way to scroll down on console content growth
  var scrollTop = 10000;
  
  // getUpdateProgressLog
  // gets content from an url defined in the data attribute of the console-div
  // when timeoutTime is > 0 its called recursively after timeoutTime ms timeout
  // @param int timeoutTime - ms to wait before next call
  function getUpdateProgressLog(timeoutTime) {
    $.ajax({
      url : $releaseUpdateProgressConsole.data("url"),
      dataType : 'json',
      success: function (text) {
        $releaseUpdateProgressConsole.text(text.text);
        if (getContentIsActive === false) {
          return;
        }
        if (timeoutTime > 0) {
         setTimeout(function() {getUpdateProgressLog(timeoutTime)}, timeoutTime); 
        }
        $releaseUpdateProgressConsole.scrollTop(scrollTop + 10000);
      }
    });
  }

  $page.delegate("form.software-update", "submit", function () {    
    $showReleaseProgressButton.fadeIn();
    $showReleaseProgressButton.click(function (e) {
      e.preventDefault();
      $releaseUpdateProgressConsole.quakeStyleConsole({
        onOpen: function() {
          getContentIsActive = true;
          getUpdateProgressLog(500);
          $showReleaseProgressButton.fadeOut();
        },
        onClose: function() {
          getContentIsActive = false;
          $showReleaseProgressButton.fadeIn();
        }
      });
      $releaseUpdateProgressConsole.data('quakeStyleConsole').open();
    });
  });
  
  $("#show_last_release_update_log").click(function(e) {
    e.preventDefault();
    $this = $(this);
    $releaseUpdateProgressConsole.quakeStyleConsole({
      onOpen: function() {
        $this.fadeOut();
        getContentIsActive = true;
        getUpdateProgressLog(0);
      },
      onClose: function() {
        $this.fadeIn();
        getContentIsActive = false;
      }
    });
    $releaseUpdateProgressConsole.data('quakeStyleConsole').open();
  });
  
});