//= require "../utils/parse_query_string.js"
//= require "../utils/template.js"

protonet.utils.Behaviors.add({
  "li.meep:focus": function(element, event) {
    var target = $(event.target);
    if (!target.is("li.meep") && !target.is("[data-meep-action]")) {
      element.trigger("blur");
      return;
    }
    
    if (element.is(".focus")) {
      return;
    }
    
    var body = $("body");
    
    var blur = function() {
      body.add(target).unbind(".meep_focus");
      element.removeClass("focus").find("[data-meep-action]").remove();
    };
    
    body
      .unbind(".meep_focus")
      .bind("focusin.meep_focus", function(event) {
        if (!$.contains(element[0], event.target)) {
          blur();
        }
      })
      .bind("focusout.meep_focus", function() {
        blur();
      });
    
    target.bind("blur.meep_focus", function() {
      blur();
    });
    
    // One .meep can consistent out of multiple meeps
    var subMeepParagaphs = element.find("article");
    subMeepParagaphs.each(function(i, subMeepParagaph) {
      subMeepParagaph = $(subMeepParagaph);
      var meepId         = subMeepParagaph.parent().data("meep").id,
          detailViewLink = new protonet.utils.Template("meep-actions-template", { id: meepId }).toElement();
      detailViewLink.appendTo(subMeepParagaph);
    });
    
    element.addClass("focus");
  },
  
  "li.meep:keydown": function(element, event) {
    var nextElement;
    if (event.keyCode === 38 || (event.keyCode === 9 && event.shiftKey)) {
      nextElement = element.prev();
    } else if (event.keyCode === 40 || (event.keyCode === 9 && !event.shiftKey)) {
      nextElement = element.next();
    } else if (event.keyCode === 13) {
      element.find("[data-meep-action='detail-view']").trigger("click").end().trigger("blur");
      return;
    } else {
      return;
    }
    
    if (nextElement.length) {
      element.trigger("blur").trigger("focusout");
      nextElement.trigger("focus").trigger("focusin");
    }
    event.preventDefault();
  }
});