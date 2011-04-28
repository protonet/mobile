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
  },
  
  /**
   * Meep links within .meep elements
   * <a data-meep-id="12">show</a>
   * Optionally specify an action
   * <a data-meep-id="12" data-meep-action="share">share</a>
   */
  "[data-meep-id]:click": function(element, event) {
    var action = element.data("meep-action");
    switch(action) {
      case "share":
        var meep = element.parents("article").data("instance");
        protonet.Notifications.trigger("form.fill", meep.getUrl());
        break;
      default:
        var data = element.parents("article").data("meep");
        protonet.window.Meep.show(data);
    }
    
    event.preventDefault();
  },
  
  /**
   * Meep links
   * <a href="http://host.com?meep_id=12">open detail view for meep #12</a>
   */
  "a[href*='meep_id=']:click": function(link, event) {
    // Make sure that it doesn't interfere with the [data-meep-id] behavior above
    if (link.data("meep-id")) {
      return;
    }
    
    link = link[0];
    if (link.host !== location.host) {
      return;
    }
    
    var parameters = protonet.utils.parseQueryString(link.hash || link.search);
    if (!parameters.meep_id) {
      return;
    }
    
    protonet.window.Meep.show(+parameters.meep_id);
    event.preventDefault();
  }
});