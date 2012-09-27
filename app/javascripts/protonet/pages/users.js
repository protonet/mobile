protonet.p("users", function($page) {
  var $meepContainer        = $page.find("output[data-user-id]"),
      $loadingIndicator     = $meepContainer.next(".progress"),
      $fileInput            = $page.find("[type=file]"),
      $avatarForm           = $fileInput.parents("form"),
      $meepList             = $("<ul>", { "class": "meeps" });
  
  var fillUpUsers = function(page) {
    var path = document.location.pathname + ".js" + document.location.search;
    $.get(path, { page: page }, function(data) {
      if (!$.trim(data)) { return; }

      $($(".common-user-list")).append(data);
      $(".common-user-list li:last-child").one("inview", function() {
        fillUpUsers(page + 1);
      });
    }, 'html');
  };

  $(".common-user-list li:last-child").one("inview", function() {
    fillUpUsers(2);
  });
  
  $meepContainer.one("inview", function() {
    function fallback() {
      $meepContainer.html($("<p>", { "class": "hint", text: protonet.t("users.hint_no_meeps_available") }));
    }
    
    $.ajax({
      url: "/users/" + $meepContainer.data("user-id") + "/meeps_with_text_extension",
      success: function(meepsData) {
        if (!meepsData.length) {
          fallback();
          return;
        }
        
        meepsData.reverse().chunk(function(meepData) {
          meepData.posted_in = meepData.channel_id;
          delete meepData.channel_id;
          return new protonet.timeline.Meep(meepData).render($meepList);
        }, function() {
          $meepContainer.html($meepList);
        });
      },
      complete: function() {
        $loadingIndicator.hide();
      },
      error: fallback
    });
  });
  
  $avatarForm.bind("submit", function() {
    var $iframe = $("<iframe>", { width: 1, height: 1, name: "upload_iframe" }).hide().insertAfter($avatarForm),
        $avatar = $page.find(".user-avatar");
    
    function reset() {
      setTimeout(function() { $iframe.remove(); }, 0);
      setTimeout(function() { $avatar.removeClass("loading"); }, 2000);
      $avatarForm.trigger("reset").find("button").removeAttr("disabled").removeClass("loading");
    }
    
    $iframe.load(function() {
      try {
        var body     = $iframe[0].contentWindow.document.documentElement,
            response = JSON.parse($.trim(body.innerText || body.textContent));
      } catch(e) {}
      
      if (!response || !response.avatar) {
        protonet.trigger("flash_message.error", (response && response.error) || protonet.t("users.flash_message_avatar_upload_error"));
      } else {
        // success
        if (!protonet.dispatcher.connected) {
          protonet.trigger("user.changed_avatar", response);
        }
      }
      reset();
    });
    
    $avatar.addClass("loading");
    $avatarForm.attr("target", "upload_iframe").find("button").addClass("loading").attr("disabled", "disabled");
  });
  
  $fileInput.bind({
    change: function() {
      $avatarForm.submit();
    },
    
    mousedown: function() {
      $avatarForm.find("button").addClass("active");
    },
    
    mouseup: function() {
      $avatarForm.find("button").removeClass("active");
    }
  }); 
  
  $("#show-comparison-chart").on("click", function() {
    var $template = new protonet.utils.Template("user-roles-table-template").to$();
    new protonet.ui.Dialog({ content: $template, headline: protonet.t("users.headline_user_types") });
    return false;
  });
  
  
  // Edit Preferences stored in storage 
  (function(){
    var preferences = protonet.data.User.getPreferencesConfig(),
        $container  = $("#settings");
    $.each(preferences, function(key, config) {
      $container.append(_getElement(key, config));
    });
    
    function _getElement(key, config){
      switch (config.type) {
        case "boolean":
          return _getBooleanElement(key, config);
        case "notification":
          return _getNotificationElement(key, config);
        default:
          return null;
      }
    }
    
    function _getNotificationElement(key, config) {
      var value = String(protonet.data.User.getPreference(key)),
          $item = $("<label>", {
            html:       config.labels[value],
            "class":    "checkbox-row",
            click:      function(event) {
              event.preventDefault();
              var oldValue = protonet.data.User.getPreference(key),
                  newValue = !oldValue,
                  callback = function(newValue) {
                    if(newValue == oldValue){
                      protonet.ui.FlashMessage.show("error", protonet.t("users.flash_message_update_settings_error"));
                    }else{
                      protonet.data.User.setPreference(key, newValue);
                      $item.removeClass(String(oldValue)).addClass(String(newValue)).html(config.labels[String(newValue)]);
                      protonet.ui.FlashMessage.show("notice", protonet.t("users.flash_message_update_settings_success"));
                    }
                  };
                  
              if (newValue) {
                protonet.ui.Notification.requestPermission(callback);
              } else {
                callback(newValue);
              }
            }
          });
        
      return $item;
    }
    
    function _getBooleanElement (key, config) {
      var value = String(protonet.data.User.getPreference(key)),
          $item = $("<label>", {
            html:       config.labels[value],
            "class":    "checkbox-row",
            click:      function(event) {
              event.preventDefault();
              var oldValue = protonet.data.User.getPreference(key),
                  newValue = !oldValue;
              protonet.data.User.setPreference(key, newValue);
              $item.removeClass(String(oldValue)).addClass(String(newValue)).html(config.labels[String(newValue)]);
              protonet.ui.FlashMessage.show("notice", protonet.t("USER_SETTINGS_SUCCESS"));
            }
          });
      return $item;
    }
  })();
  
});