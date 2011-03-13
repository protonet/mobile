//= require "../utils/parse_query_string.js"

protonet.utils.Behaviors.add({
  "li.meep:focus": function(element) {
    // One .meep can consistent out of multiple meeps
    var subMeepParagaphs = element.find("article > p");
    subMeepParagaphs.each(function(i, subMeepParagaph) {
      subMeepParagaph = $(subMeepParagaph);
      var meepId         = subMeepParagaph.parent().data("meep").id,
          detailViewLink = new protonet.utils.Template("meep-detail-view-link-template", { id: meepId }).toElement();
      detailViewLink
        .appendTo(subMeepParagaph)
        .bind("mousedown", false);
    });
  },
  
  "li.meep:blur": function(element) {
    element.find(".detail-link").remove();
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
    if (link.host != location.host) {
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