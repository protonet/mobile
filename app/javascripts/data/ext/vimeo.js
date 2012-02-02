protonet.data.Vimeo = {
  TIMEOUT: 5000, // 5 seconds
  URL: location.protocol + "//vimeo.com/api/v2/video/{id}.json?callback=?",
  
  getVideo: function(id, onSuccess, onFailure) {
    $.ajax({
      url: this.URL.replace("{id}", id),
      cache: true,
      dataType: "jsonp",
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