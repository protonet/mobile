protonet.data.Oohembed = {
  TIMEOUT: 5000, // milliseconds
  URL: "http://oohembed.com/oohembed/?url={url}&callback=?",
  
  get: function(url, onSuccess, onFailure) {
    $.jsonp({
      url: this.URL.replace("{url}", encodeURIComponent(url)),
      cache: true,
      pageCache: true,
      timeout: this.TIMEOUT,
      success: onSuccess,
      error: onFailure
    });
  }
};