protonet.data.Facebook = (function() {
  var URL = location.protocol + "//graph.facebook.com/{id}?callback=?",
      PICTURE_URL = location.protocol + "//graph.facebook.com/{id}/picture?type=large",
      TIMEOUT = 4000;
  
  function getOpenGraphData(id, onSuccess, onFailure) {
    var apiUrl = URL.replace("{id}", id);
    
    $.ajax({
      url: apiUrl,
      cache: true,
      dataType: "jsonp",
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