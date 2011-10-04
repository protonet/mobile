$(function() {
  var $subpage          = $(".users-page"),
      $meepContainer    = $subpage.find("output[data-user-id]"),
      $loadingIndicator = $meepContainer.next(".progress"),
      $meepList         = $("<ul>", { "class": "meeps" });
  
  $meepContainer.bind("inview", function() {
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
  
  $subpage.find("[type=file]").bind({
    change: function() {
      var $form           = $(this.form),
          $iframe         = $("<iframe>", { width: 1, height: 1, name: "upload_iframe" }).hide().insertAfter($form),
          $avatarElement  = $subpage.find(".user-avatar");
        
      function reset() {
        setTimeout(function() { $iframe.remove(); }, 0);
        setTimeout(function() { $avatarElement.removeClass("loading"); }, 1000);
        $form.trigger("reset").find("button").removeAttr("disabled").removeClass("loading");
      }
      
      $iframe.load(function() {
        try {
          var body = $iframe[0].contentWindow.document.documentElement,
              response = JSON.parse($.trim(body.innerText || body.textContent));
        } catch(e) {}
        
        if (!response || !response.success) {
          protonet.trigger("flash_message.error", (response && response.error) || protonet.t("AVATAR_UPLOAD_ERROR"));
        }
        reset();
      });
      
      $avatarElement.addClass("loading");
      $form.attr("target", "upload_iframe").submit().find("button").addClass("loading").attr("disabled", "disabled");
    },
    
    mousedown: function() {
      $(this.form).find("button").addClass("active");
    },
    
    mouseup: function() {
      $(this.form).find("button").removeClass("active");
    }
  });
});