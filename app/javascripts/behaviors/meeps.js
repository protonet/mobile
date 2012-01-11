$.behaviors({
  "li.meep:focus": function(element, event) {
    var $target     = $(event.target),
        $element    = $(element),
        actionLink  = ".detail-view-link, .share-link";
    
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
          $actionLinks      = new protonet.utils.Template("meep-actions-template", { id: meepId }).to$();
      $actionLinks.unbind(".meep_focus").bind("beforeactivate.meep_focus mousedown.meep_focus", false).appendTo($subMeepParagaph);
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
    } else if (event.keyCode === 13) {
      $element.find(".detail-view-link:last").trigger("click").end().trigger("blur");
      return;
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
