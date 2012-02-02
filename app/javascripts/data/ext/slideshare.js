protonet.data.SlideShare = (function() {
  var TIMEOUT = 5000,
      URL     = "http://www.slideshare.net/api/oembed/2?format=jsonp&callback=?";
  
  return {
    getSlideShow: function(slideShareUrl, onSuccess, onFailure) {
      $.ajax({
        url:      URL,
        data:     {
          url: slideShareUrl
        },
        dataType: "jsonp",
        cache:    true,
        timeout:  TIMEOUT,
        success:  function(response) {
          if (response.error) {
            return onFailure(response);
          }
          onSuccess(response);
        },
        error: onFailure
      });
    }
  };
})();