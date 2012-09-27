$.behaviors({
  "li.meep:focus": function(element, event) {
    var $target     = $(event.target),
        $element    = $(element),
        actionLink  = ".meep-action-link";
    
    if (!$target.is("li.meep") && !$target.is(actionLink)) {
      $element.trigger("blur");
      return;
    }
    
    if ($element.is(".focus")) {
      return;
    }
    
    var $body = $("body");
    
    var blur = function() {
      $body.add($target).unbind(".meep_focus");
      $element.removeClass("focus").find(actionLink).remove();
    };
    
    $body
      .unbind(".meep_focus")
      .bind("focusin.meep_focus", function(event) {
        if (!$.contains(element, event.target)) {
          blur();
        }
      })
      .bind("focusout.meep_focus", function(event) {
        blur();
      });
    
    $target.bind("blur.meep_focus", function() {
      blur();
    });
    
    // One .meep can consistent out of multiple meeps
    var $subMeepParagaphs = $element.find("article");
    $subMeepParagaphs.each(function(i, subMeepParagaph) {
      var $subMeepParagaph  = $(subMeepParagaph),
          meepId            = $subMeepParagaph.data("meep").id,
          $actionLinks      = new protonet.utils.Template("meep-actions-template").to$();
      $actionLinks.bind("beforeactivate.meep_focus mousedown.meep_focus", false).appendTo($subMeepParagaph);
    });
    
    $element.addClass("focus");
  },
  
  "li.meep:keydown": function(element, event) {
    var $nextElement,
        $element = $(element);
    if (event.keyCode === 38 || (event.keyCode === 9 && event.shiftKey)) {
      $nextElement = $element.prev();
    } else if (event.keyCode === 40 || (event.keyCode === 9 && !event.shiftKey)) {
      $nextElement = $element.next();
    } else {
      return;
    }
    
    if ($nextElement.length) {
      $element.trigger("blur").trigger("focusout");
      $nextElement.trigger("focus").trigger("focusin");
    }
    event.preventDefault();
  }
});


// TODO: Make ContextMenu part of behaviors
(function() {
  var $meep, contextOptions = {};
  
  contextOptions[protonet.t("meeps.link_share")] = function($target, close) {
    var data  = $meep.data("meep");
    if (data) {
      protonet.trigger("modal_window.hide").trigger("form.share_meep", data.id);
    }
    close();
  };
  
  contextOptions[protonet.t("meeps.link_show_detail_view")] = function($target, close) {
    var instance = $meep.data("instance");
    if (instance) {
      protonet.open(instance.getUrl());
    }
    close();
  };
  
  contextOptions[protonet.t("meeps.link_delete")] = function($target, close) {
    var instance = $meep.data("instance");
    
    if (instance) {
      $.ajax({
        url:     instance.getUrl(),
        type:    "delete",
        success: function() {
          protonet.trigger("flash_message.notice", protonet.t("meeps.flash_message_delete_success"));
        },
        error: function() {
          protonet.trigger("flash_message.error", protonet.t("meeps.flash_message_delete_error"));
        }
      });
    }
    
    close();
  };
  
  var contextMenu = new protonet.ui.ContextMenu("a.meep-action-link", contextOptions, "context-menu-meep");
  
  contextMenu.bind("opening", function(e, menu, $target) {
    $meep = $target.parents("article");
    
    var $children   = menu.list.children().show(),
        data        = $meep.data("meep"),
        isMeepOwner = data.user_id == protonet.config.user_id || protonet.data.User.isAdmin(protonet.config.user_id);
    if (!isMeepOwner) {
      $children.filter("li:contains('" + protonet.t("meeps.link_delete") + "')").hide();
    }
  });
})();

