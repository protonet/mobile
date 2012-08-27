/**
 * Checks whether the url is of a supported url shortener
 * if not, fire the callback with the original url
 * else grab it from untiny.me
 * 
 * @example
 *    protonet.utils.unshortUrl("http://goo.gl/maps/BqzS", function(longUrl) {
 *      // doSomething with longUrl
 *    });
 */
protonet.utils.unshortUrl = (function() {
  var API_URL = "http://api.longurl.org/v2/expand?format=json&callback=?",
      TIMEOUT = 2500; // ms - requests to longurl.org shouldn't take longer than this
      SUPPORTED_SERVICES = [
        "bit.ly",
        "cli.gs",
        "fb.me",
        "ff.im",
        "flic.kr",
        "is.gd",
        "goo.gl",
        "fav.me",
        "j.mp",
        "ow.ly",
        "snipurl.com",
        "t.co",
        "tcrn.ch",
        "tinyurl.com",
        "tr.im"
      ];
  
  function getLongUrl(url, callback) {
    var failure = function() {
      callback(url);
    };
    
    $.ajax({
      url: API_URL,
      data: {
        url: url
      },
      cache: true,
      dataType: "jsonp",
      timeout: TIMEOUT,
      success: function(response) {
        var longUrl = response["long-url"];
        longUrl ? callback(longUrl) : failure();
      },
      error: failure
    });
  }
  
  return function(url, callback) {
    var i = SUPPORTED_SERVICES.length;
    while (i--) {
      if (url.startsWith("http://" + SUPPORTED_SERVICES[i])) {
        getLongUrl(url, callback);
        return;
      }
    }
    callback(url);
  };
})();