protonet.data.Vimeo = {
  TIMEOUT: 5000, // 5 seconds
  URL: "http://vimeo.com/api/v2/video/{id}.json?callback=?",
  
  getVideo: function(id, onSuccess, onFailure) {
    $.jsonp({
      url: this.URL.replace("{id}", id),
      cache: true,
      pageCache: true,
      timeout: this.TIMEOUT,
      success: function(response) {
        var entry = response[0];
        if (!entry) {
          return onFailure(response);
        }
        onSuccess(entry);
      },
      error: onFailure
    });
  }
};