protonet.data.YouTube = {
  TIMEOUT: 5000, // 5 seconds
  
  getVideo: function(id, onSuccessCallback, onFailureCallback) {
    var timeouted, fallback = setTimeout(function() {
      timeouted = true;
      onFailureCallback();
    }, this.TIMEOUT);
    
    $.getJSON(
      "http://gdata.youtube.com/feeds/api/videos/" + id + "?v=2&alt=json-in-script&format=5&callback=?",
      function(response) {
        if (timeouted) { return; }
        clearTimeout(fallback);
        
        onSuccessCallback(response);
      }
    );
  }
};