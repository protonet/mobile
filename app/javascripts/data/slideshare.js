//= require "yql.js"

protonet.data.SlideShare = (function() {
  var API_KEY = "QIy5ImfB",
      SECRET = "IVnEB1Vn",
      URL = "http://www.slideshare.net/api/2/get_slideshow";
  
  function getSlideShow(slideShareUrl, onSuccessCallback, onFailureCallback) {
    var timestamp = Math.round(new Date().getTime() / 1000),
        hash = SHA1(SECRET + "" + timestamp),
        apiUrl = URL + "?" + $.param({
          api_key: API_KEY,
          hash: hash,
          ts: timestamp,
          slideshow_url: slideShareUrl
        });
    
    new protonet.data.YQL.Query("select * from xml where url='" + apiUrl + "'").execute(
      onSuccessCallback,
      onFailureCallback
    );
  }
  
  return {
    getSlideShow: getSlideShow
  };
})();