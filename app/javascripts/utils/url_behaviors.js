/**
 * Triggers events when the given reg exp matches the url
 *
 * @example
 *    protonet.utils.urlBehaviors({
 *      // event name                   // reg exp
 *      "form.fill":                    /(?:\?|&)message=([^&#$]+)(.*)/,
 *      "text_extension_input.select":  /(?:\?|&)url=([^&#$]+)(.*)/,
 *      "form.share_meep":              /(?:\?|&)share=([^&#$]+)(.*)/,
 *      "form.create_reply":            /(?:\?|&)reply_to=([^&#$]+)(.*)/
 *    });
 */
protonet.utils.urlBehaviors = (function(location) {
  return function(mappings) {
    $.each(mappings, function(eventName, regExp) {
      var match = location.href.match(regExp),
          newUrl;
      if (match) {
        newUrl = location.href.replace(regExp, function(match, $1, $2) {
          if (match.substr(0, 1) === "?" && location.href.indexOf("&") !== -1) {
            return "?";
          } else {
            return $2;
          }
        });
        protonet.trigger(eventName, decodeURIComponent(match[1]));
        protonet.utils.History.replace(newUrl);
      }
    });
  };
})(location);