/**
 * Turns such an url...
 *    http://foobar.com/test.php?utm_source=feedburner&utm_medium=feed&utm_campaign=foo&utm_content=Google+Reader
 * ...into...
 *    http://foobar.com/test.php
 *
 * crazy, huh?
 */
protonet.utils.stripTrackingParams = (function() {
  var paramsToStrip = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"],
      trailingQuestionMark = /\?+$/,
      trailingAmpercent = /\&+$/;
  
  return function(url) {
    for (var i=0, length=paramsToStrip.length; i<length; i++) {
      url = url.replace(new RegExp(paramsToStrip[i] + "=.*?(&|$)"), "");
    }
    
    // Remove last lonely & or ?
    url = url.replace(trailingAmpercent, "").replace(trailingQuestionMark, "");
    
    return url;
  };
})();