protonet.data.YouTube = {
  TIMEOUT: 5000, // 5 seconds
  URL: "http://gdata.youtube.com/feeds/api/videos/{id}?v=2&alt=json-in-script&format=5&callback=?",
  
  getVideo: function(id, onSuccess, onFailure) {
    $.jsonp({
      url: this.URL.replace("{id}", id),
      cache: true,
      pageCache: true,
      timeout: this.TIMEOUT,
      success: function(response) {
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