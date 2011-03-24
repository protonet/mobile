//= require "../utils/parse_query_string.js"
//= require "../utils/template.js"

protonet.utils.Behaviors.add({
  "li.meep:focus": function(element, event) {
    var target = $(event.target);
    if (!target.is("li.meep") && !target.is(".detail-link")) {
      element.trigger("blur");
      return;
    }
    
    if (element.is(".focus")) {
      return;
    }
    
    // Needed for webkit
    element.unbind("mouseup.meep_focus").bind("mouseup.meep_focus", function() {
      setTimeout(function() {
        if (element.is(":hidden")) {
          element.trigger("blur");
        }
      }, 0);
    });
    
    // One .meep can consistent out of multiple meeps
    var subMeepParagaphs = element.find("article");
    subMeepParagaphs.each(function(i, subMeepParagaph) {
      subMeepParagaph = $(subMeepParagaph);
      var meepId         = subMeepParagaph.parent().data("meep").id,
          detailViewLink = new protonet.utils.Template("meep-detail-view-link-template", { id: meepId }).toElement();
      detailViewLink.appendTo(subMeepParagaph);
    });
    
    element.addClass("focus");
  },
  
  "li.meep:blur": function(element, event) {
    element.removeClass("focus").find(".detail-link").remove();
  },
  
  "li.meep:keydown": function(element, event) {
    var nextElement;
    if (event.keyCode === 38) {
      nextElement = element.prev();
    } else if (event.keyCode === 40 || event.keyCode === 9) {
      nextElement = element.next();
    } else if (event.keyCode === 13) {
      element.find(".detail-link").trigger("click").end().trigger("blur");
    } else {
      return;
    }
    
    if (nextElement.length) {
      element.trigger("blur");
      nextElement.trigger("focus");
    }
    event.preventDefault();
  },
  
  /**
   * Meep links within .meep elements
   * <a data-meep-id="12">show</a>
   */
  "[data-meep-id]:click": function(element, event) {
    var data = element.parents("article").data("meep");
    protonet.window.Meep.show(data);
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