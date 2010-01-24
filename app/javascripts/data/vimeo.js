protonet.data.Vimeo = {
  TIMEOUT: 5000, // 5 seconds
  
  getVideo: function(id, onSuccessCallback, onFailureCallback) {
    var timeouted, fallback = setTimeout(function() {
      timeouted = true;
      onFailureCallback();
    }, this.TIMEOUT);
    
    $.getJSON(
      "http://vimeo.com/api/v2/video/" + id + ".json?callback=?",
      function(response) {
        if (timeouted) { return; }
        clearTimeout(fallback);
        onSuccessCallback(response);
      }
    );
  }
};