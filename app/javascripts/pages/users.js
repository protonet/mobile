$(function() {
  var $subpage          = $(".users-page"),
      $meepContainer    = $subpage.find("output[data-user-id]"),
      $loadingIndicator = $meepContainer.next(".progress"),
      $fileInput        = $subpage.find("[type=file]"),
      $avatarForm       = $fileInput.parents("form"),
      $meepList         = $("<ul>", { "class": "meeps" });
  
  $meepContainer.bind("inview", function() {
    $meepContainer.unbind("inview");
    
    function fallback() {
      $meepContainer.html($("<p>", { "class": "hint", text: protonet.t("NO_MEEPS_FOR_USER_AVAILABLE") }));
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
        $avatar = $subpage.find(".user-avatar");
    
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
        protonet.trigger("flash_message.error", (response && response.error) || protonet.t("AVATAR_UPLOAD_ERROR"));
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
});