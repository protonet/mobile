//= require "../utils/parse_query_string.js"

protonet.utils.Behaviors.add({
  "a[href*='search=']:click": function(link, event) {
    link = link[0];
    if (link.host !== location.host) {
      return;
    }
    
    var parameters = protonet.utils.parseQueryString(link.hash || link.search);
    if (!parameters.search) {
      return;
    }
    
    protonet.window.Search.show(parameters.search);
    event.preventDefault();
  }
});