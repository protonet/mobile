//= require "../data/yql.js"

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
  var YQL_QUERY = "SELECT * FROM json WHERE url = 'http://untiny.me/api/1.0/extract/?url={url}&format=json'";
  
  var TIMEOUT = 2500; // ms - requests to untiny.me shouldn't take longer than this
  
  var SUPPORTED_SERVICES = [
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
    "tcrn.ch",
    "tinyurl.com",
    "tr.im"
  ];
  
  function getLongUrl(url, callback) {
    var failure = function() {
      callback(url);
    };
    
    var query = YQL_QUERY.replace("{url}", encodeURIComponent(url));
    
    new protonet.data.YQL.Query(query).execute(function(response) {
      if (response.org_url) {
        callback(response.org_url);
      } else {
        failure();
      }
    }, failure);
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