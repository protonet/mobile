protonet.data.YouTube = (function() {
  var TIMEOUT = 5000,
      URL     = location.protocol + "//gdata.youtube.com/feeds/api/videos/{id}?v=2&alt=json-in-script&format=5&fields=media%3Agroup%2Cyt%3Anoembed&callback=?"
  
  return {
    getVideo: function(id, onSuccess, onFailure) {
      $.ajax({
        url:      URL.replace("{id}", id),
        dataType: "jsonp",
        cache:    true,
        timeout:  TIMEOUT,
        success:  function(response) {
          var entry = response.entry;
          if (!entry) {
            return onFailure(response);
          }
          onSuccess(entry);
        },
        error: onFailure
      });
    }
  };
})();