protonet.data.YouTube = {
  TIMEOUT: 5000, // milliseconds
  
  // fields= minimizes the response to the relevant data (title, description, ...)
  URL: "http://gdata.youtube.com/feeds/api/videos/{id}?v=2&alt=json-in-script&format=5&fields=media%3Agroup%2Cyt%3Anoembed&callback=?",
  
  getVideo: function(id, onSuccess, onFailure) {
    $.ajax({
      url: this.URL.replace("{id}", id),
      dataType: "jsonp",
      cache: true,
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