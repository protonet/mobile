protonet.data.Facebook = (function() {
  var URL = "http://graph.facebook.com/{id}?callback=?",
      PICTURE_URL = "http://graph.facebook.com/{id}/picture?type=large",
      TIMEOUT = 4000;
  
  function getOpenGraphData(id, onSuccess, onFailure) {
    var apiUrl = URL.replace("{id}", id);
    
    $.jsonp({
      url: apiUrl,
      cache: true,
      pageCache: true,
      timeout: TIMEOUT,
      success: function(data) {
        if (!data) {
          return onFailure();
        }
        onSuccess($.extend(data, {
          picture: PICTURE_URL.replace("{id}", id)
        }));
      },
      error: onFailure
    });
  }
  
  return {
    getOpenGraphData: getOpenGraphData
  };
})();