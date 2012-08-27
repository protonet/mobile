//= require "escape_for_reg_exp.js"
//= require "parse_query_string.js"
/**
 * Triggers events when the given param is in the url
 *
 * @example
 *    protonet.utils.urlBehaviors({
 *      // event name                   // param
 *      "form.fill":                    "message",
 *      "text_extension_input.select":  "url",
 *      "form.share_meep":              "share",
 *      "form.create_reply":            "reply_to"
 *    });
 */
protonet.utils.urlBehaviors = (function(location) {
  return function(mappings) {
    var queryParams = protonet.utils.parseQueryString(location.href);
    $.each(mappings, function(paramName, eventName) {
      var value = queryParams[paramName],
          regExp,
          newUrl;
      if (value) {
        protonet.trigger(eventName, value);
      }
      delete queryParams[paramName];
    });
    
    var newParams = $.param(queryParams),
        newUrl = location.protocol + "//" + location.host + location.pathname + (newParams ? "?" : "") + newParams + location.hash;
    protonet.utils.History.replace(newUrl);
  };
})(location);