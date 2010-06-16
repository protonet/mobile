//= require "../lib/webtoolkit.sha1.js"
//= require "yql.js"

protonet.data.SlideShare = (function() {
  var API_KEY = "QIy5ImfB",
      SECRET = "IVnEB1Vn",
      URL = "http://www.slideshare.net/api/2/get_slideshow";
  
  function getSlideShow(slideShareUrl, onSuccess, onFailure) {
    var timestamp = Math.round(new Date().getTime() / 1000),
        hash = SHA1(SECRET + "" + timestamp),
        apiUrl = URL + "?" + $.param({
          api_key: API_KEY,
          hash: hash,
          ts: timestamp,
          slideshow_url: slideShareUrl
        });
    
    new protonet.data.YQL.Query(
      "SELECT * FROM xml WHERE url='" + apiUrl + "'"
    ).execute(function(response) {
      var slideshow = response.Slideshow;
      if (!slideshow) {
        return onFailure(response);
      }
      onSuccess(slideshow);
    }, onFailure);
  }
  
  return {
    getSlideShow: getSlideShow
  };
})();