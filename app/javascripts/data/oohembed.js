protonet.data.Oohembed = {
  TIMEOUT: 5000, // milliseconds
  URL: "http://oohembed.com/oohembed/?url={url}&callback=?",
  
  get: function(url, onSuccess, onFailure) {
    $.ajax({
      url: this.URL.replace("{url}", encodeURIComponent(url)),
      cache: true,
      dataType: "jsonp",
      timeout: this.TIMEOUT,
      success: onSuccess,
      error: onFailure
    });
  }
};